package net.scit.backend.member.service.impl;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.MailComponents;
import net.scit.backend.member.dto.MemberDTO;
import net.scit.backend.member.dto.SignupDTO;
import net.scit.backend.member.dto.VerificationDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.member.service.MemberService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private static final Long MAIL_EXPIRES_IN = 300000L;

    private final MemberRepository memberRepository;
    private final MailComponents mailComponents;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public ResultDTO<SuccessDTO> signup(SignupDTO signupDTO) {
        // 검증은 나중에 추가
        if (!signupDTO.isEmailCheck()) {
            // CustomException으로 변경
            throw new RuntimeException("이메일 인증이 완료되지 안았습니다.");
        }

        MemberDTO memberDTO = MemberDTO.builder()
                .email(signupDTO.getEmail())
                .password(signupDTO.getPassword())
                .name(signupDTO.getName())
                .nationality(signupDTO.getNationality())
                .language(signupDTO.getLanguage())
                .socialLoginCheck("없음")
                .profileImage(signupDTO.getProfileImage())
                .build();
        MemberEntity temp = MemberEntity.toEntity(memberDTO);
        memberRepository.save(temp);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        return ResultDTO.of("회원 가입에 성공했습니다.", successDTO);
    }

    @Override
    public ResultDTO<SuccessDTO> checkEmail(String email) {
        Optional<MemberEntity> byEmail = memberRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            // 나중에 CustomException으로 변경
            throw new RuntimeException("중복된 이메일 입니다.");
        }

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        return ResultDTO.of("이메일 중복 체크에 성공했습니다.", successDTO);
    }

    @Override
    public ResultDTO<SuccessDTO> signupSendMail(String email) {

        String title = "BIBIM 회원가입 인증메일";
        String code = generateRandomUUID();
        String message = "<h3>5분안에 인증번호를 입력해주세요</h3> <br>" +
                        "<h1>" + code + "</h1>";

        // 보내기전에 기존에 보낸 코드가 있는지 확인하고 Redis에서 삭제 후 메일 전송
        if (redisTemplate.opsForValue().get("signup: " + email) != null) {
            redisTemplate.delete("signup: " + email);
        }
        mailComponents.sendMail(email, title, message);

        // redis에 uuid를 임시 저장
        redisTemplate.opsForValue()
                .set("signup: " + email, code, MAIL_EXPIRES_IN, TimeUnit.MILLISECONDS);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        return ResultDTO.of("메일을 보내는 것을 성공했습니다.", successDTO);
    }

    @Override
    public ResultDTO<SuccessDTO> checkMail(VerificationDTO verificationDTO) {

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

    public static String generateRandomUUID() {
        Random random = new Random();
        int randomNumber = random.nextInt(900000) + 100000; // 6자리 숫자 생성 (100000부터 999999까지)
        return String.valueOf(randomNumber);
    }
}
