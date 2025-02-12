package net.scit.backend.member.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.MailComponents;
import net.scit.backend.member.dto.MemberDTO;
import net.scit.backend.member.dto.MyInfoDTO;
import net.scit.backend.member.dto.SignupDTO;
import net.scit.backend.member.dto.VerificationDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.member.service.MemberService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * Member관련 업무를 수행하는 Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

    private static final Long MAIL_EXPIRES_IN = 300000L;

    private final MemberRepository memberRepository;
    private final MailComponents mailComponents;
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * 회원가입 처리를 수행하는 메소드
     *
     * @param signUpRequest 회원가입 요청 정보를 담은 DTO
     * @param file
     * @return 회원가입 후 결과 확인
     * @throws RuntimeException 이메일 인증이 완료되지 않은 경우
     */
    @Override
    public ResultDTO<SuccessDTO> signup(SignupDTO signupDTO, MultipartFile file) {
        // 검증은 나중에 추가
        if (!signupDTO.isEmailCheck()) {
            // CustomException으로 변경
            throw new RuntimeException("이메일 인증이 완료되지 안았습니다.");
        }

        // 프로필 이미지
        String imageUrl = null;
        if (file != null || !file.isEmpty()) {
            // 파일 이름에서 확장자 추출
            String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            // 지원하는 이미지 파일 확장자 목록
            List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "gif");
            // 확장자가 이미지 파일인지 확인
            if (fileExtension != null && allowedExtensions.contains(fileExtension.toLowerCase())) {
                try { // 이미지 업로드하고 url 가져오기
                    imageUrl = s3Uploader.upload(file, "profile-images");
                } catch (Exception e) {
                    //CustomException으로 변경 해야함
                    throw new RuntimeException("이미지 저장에 실패했습니다.");
                }
            } else {
                // 이미지 파일이 아닌 경우에 대한 처리
                //CustomException으로 변경 해야함
                throw new RuntimeException("지원하는 이미지 형태가 아닙니다.");
            }
        }

        // signupDTO의 변수를 memberDTO에 복사
        MemberDTO memberDTO = MemberDTO.builder()
                .email(signupDTO.getEmail())
                .password(signupDTO.getPassword())
                .name(signupDTO.getName())
                .nationality(signupDTO.getNationality())
                .language(signupDTO.getLanguage())
                .socialLoginCheck("없음")
                .profileImage(imageUrl)
                .build();
        // DTO를 entity로 변경
        MemberEntity temp = MemberEntity.toEntity(memberDTO);
        // 디비 저장
        memberRepository.save(temp);
        // 성공시 DTO 저장
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("회원 가입에 성공했습니다.", successDTO);
    }

    /**
     * 이메일 중복 체크 하는 메소드
     * 
     * @param email 회원가입 신청한 email
     * @return 중복체크 후 결과 확인
     */
    @Override
    public ResultDTO<SuccessDTO> checkEmail(String email) {
        // email 중복 검사
        Optional<MemberEntity> byEmail = memberRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            // 나중에 CustomException으로 변경
            throw new RuntimeException("중복된 이메일 입니다.");
        }

        // 성공시 DTO 저장
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("이메일 중복 체크에 성공했습니다.", successDTO);
    }

    /**
     * 회원가입 인증 메일 보내는 메소드
     * 
     * @param email 회원가입 요청 후 인증 받으려는 email
     * @return 메일 보낸 후 결과 확인
     */
    @Override
    public ResultDTO<SuccessDTO> signupSendMail(String email) {

        // email 양식
        String title = "BIBIM 회원가입 인증메일";
        String code = generateRandomUUID();
        String message = "<h3>5분안에 인증번호를 입력해주세요</h3> <br>" +
                        "<h1>" + code + "</h1>";

        // 보내기전에 기존에 보낸 코드가 있는지 확인하고 Redis에서 삭제 후 메일 전송
        if (redisTemplate.opsForValue().get("signup: " + email) != null) {
            redisTemplate.delete("signup: " + email);
        }
        // mailcomponent의 sendmail 메소드를 통해 해당 email 주소에 메일을 전송
        mailComponents.sendMail(email, title, message);

        // redis에 uuid를 임시 저장
        redisTemplate.opsForValue()
                .set("signup: " + email, code, MAIL_EXPIRES_IN, TimeUnit.MILLISECONDS);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        return ResultDTO.of("메일을 보내는 것을 성공했습니다.", successDTO);
    }

    /**
     * 인증 코드 확인하는 메소드
     * 
     * @param verificationDTO 메일 체크를 위한 클래스
     * @return 메일 체크 후 결과 확인
     * @throws RuntimeException 인증코드 에러
     */
    @Override
    public ResultDTO<SuccessDTO> checkMail(VerificationDTO verificationDTO) {

        // 서버에서 보낸 코드와 사용자가 입력한 코드를 서로 비교
        String code = redisTemplate.opsForValue().get("signup: " + verificationDTO.getEmail());
        if (!code.equals(verificationDTO.getCode())) {
            // 나중에 CustomException으로 변경
            throw new RuntimeException("인증코드가 잘못되었습니다.");
        }

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        return ResultDTO.of("인증에 성공했습니다.", successDTO);
    }

    /**
     * 랜덤 UUID 생성을 위한 static 메소드
     * 
     * @return 생성한 UUID를 문자열로 변경 후 반환
     */
    public static String generateRandomUUID() {
        Random random = new Random();
        int randomNumber = random.nextInt(900000) + 100000; // 6자리 숫자 생성 (100000부터 999999까지)
        return String.valueOf(randomNumber);
    }

    //회원 정보 확인
    // 로그인 완성 후 email이 아니라 token을 받아서 회원정보를 받아야함
    @Override
    public ResultDTO<MyInfoDTO> myInfo(String email) {
        Optional<MemberEntity> byEmail = memberRepository.findByEmail(email);
        if (!byEmail.isPresent()) {
            throw new RuntimeException("해당 계정이 존재하지 않습니다.");
        }

        MemberEntity memberEntity = byEmail.get();
        MemberDTO memberDTO = MemberDTO.toDTO(memberEntity);

        // MyInfoDTO 객체 생성 (빌더 패턴 사용)
        MyInfoDTO myInfoDTO = MyInfoDTO.builder()
                .success(true)
                .email(memberDTO.getEmail())
                .name(memberDTO.getName())
                .nationality(memberDTO.getNationality())
                .language(memberDTO.getLanguage())
                .profileImage(memberDTO.getProfileImage())
                .socialLoginCheck(memberDTO.getSocialLoginCheck())
                .regDate(memberDTO.getRegDate())
                .build();

        return ResultDTO.of("회원 정보 조회에 성공했습니다.", myInfoDTO);
    }

}
