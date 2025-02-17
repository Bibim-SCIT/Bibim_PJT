package net.scit.backend.member.service.impl;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.auth.JwtTokenProvider;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.MailComponents;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.dto.*;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.member.service.MemberService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
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
    private final S3Uploader s3Uploader;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final HttpServletRequest httpServletRequest;

    /**
     * 회원가입 처리를 수행하는 메소드
     *
     * @param signupDTO 회원가입 요청 정보를 담은 DTO
     * @param file
     * @return 회원가입 후 결과 확인
     * @throws RuntimeException 이메일 인증이 완료되지 않은 경우
     */
    @Override
    public ResultDTO<SuccessDTO> signup(SignupDTO signupDTO, MultipartFile file) {
        // 검증은 나중에 추가

        if (!signupDTO.isEmailCheck()) {
            throw new CustomException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        // 검증 로그 찍어보기 (250217 추가)
        log.info("🚀 회원가입 요청: {}", signupDTO);
        log.info("📷 받은 파일: {}", (file != null ? file.getOriginalFilename() : "파일 없음"));

        // 프로필 이미지
        String imageUrl = null;
        if (file != null && !file.isEmpty()) { // ✅ file이 null인지 먼저 체크한 후 isEmpty() 확인
            // 파일 이름에서 확장자 추출
            String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            // 지원하는 이미지 파일 확장자 목록
            List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "gif");
            // 확장자가 이미지 파일인지 확인
            if (fileExtension != null && allowedExtensions.contains(fileExtension.toLowerCase())) {
                try { // 이미지 업로드하고 url 가져오기
                    imageUrl = s3Uploader.upload(file, "profile-images");
                    log.info("✅ 업로드 완료: {}", imageUrl);
                } catch (Exception e) {
                    log.error(e.getMessage(), e);
                    log.error("❌ S3 업로드 실패: {}", e.getMessage());
                    throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
                }
            } else {
                // 이미지 파일이 아닌 경우에 대한 처리
                log.warn("⚠️ 파일이 없으므로 기본 프로필 이미지를 사용합니다.");
                throw new CustomException(ErrorCode.UN_SUPPORTED_IMAGE_TYPE);
            }
        }
        log.info("📝 최종 저장할 이미지 URL: {}", imageUrl);

        // password 암호화
        String password = bCryptPasswordEncoder.encode(signupDTO.getPassword());

        // signupDTO의 변수를 memberDTO에 복사
        MemberDTO memberDTO = MemberDTO.builder()
                .email(signupDTO.getEmail())
                .password(password)
                .name(signupDTO.getName())
                .nationality(signupDTO.getNationality())
                .language(signupDTO.getLanguage())
                .socialLoginCheck("없음")
                .profileImage(imageUrl) // ✅ imageUrl이 DTO에 저장됨
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
            throw new CustomException(ErrorCode.EMAIL_DUPLICATE);
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
            throw new CustomException(ErrorCode.INVALID_EMAIL_CODE);
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

    // 회원 정보 확인
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

    // 로그인 시 JWT토큰 관련 순환참조를 막기 위해 DB 내 쿼리문 재정의
    @Override
    public Optional<MemberEntity> findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    @Override
    public ResultDTO<SuccessDTO> logout() {
        String email = AuthUtil.getLoginUserId();
        memberRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        String accessToken = jwtTokenProvider.getJwtFromRequest(httpServletRequest);
        Claims claimsFromToken = jwtTokenProvider.getClaimsFromToken(accessToken);
        String tokenType = (String) claimsFromToken.get("token_type");
        if (tokenType == null || !tokenType.equals("access")) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        // 해당 accessToken 유효시간을 가지고 와서 Redis에 BlackList로 추가
        long expiration = jwtTokenProvider.getExpiration(accessToken);
        long now = (new Date()).getTime();
        long accessTokenExpiresIn = expiration - now;
        redisTemplate.opsForValue()
                .set(accessToken, "logout", accessTokenExpiresIn, TimeUnit.MILLISECONDS);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("로그아웃에 성공했습니다.", successDTO);
    }
    /**
     * 회원 정보를 수정하는 메소드
     *
     * @return 수정된 memberDTO를 전달.
     */
    @Override
    public ResultDTO<MemberDTO> updateInfo(String email, UpdateInfoDTO updateInfoDTO) {
        // 이메일 존재 확인
        Optional<MemberEntity> optionalMember = memberRepository.findByEmail(email);
        if (optionalMember.isEmpty()) {
            throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // Optional에서 꺼냄
        MemberEntity member = optionalMember.get();

        // 업데이트할 값이 null이면 기존 값을 유지
        member.setName(updateInfoDTO.getName() != null ? updateInfoDTO.getName() : member.getName());
        member.setNationality(
                updateInfoDTO.getNationality() != null ? updateInfoDTO.getNationality() : member.getNationality());
        member.setLanguage(updateInfoDTO.getLanguage() != null ? updateInfoDTO.getLanguage() : member.getLanguage());

        // 변경된 정보 저장
        memberRepository.save(member);

        MemberDTO memberDTO = MemberDTO.toDTO(member);

        // 클라이언트에게 응답 반환
        return ResultDTO.of("회원 정보가 성공적으로 수정되었습니다.",
                memberDTO);
    }

}
