package net.scit.backend.member.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.common.component.MailComponents;
import net.scit.backend.common.component.S3Uploader;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.jwt.JwtTokenProvider;
import net.scit.backend.member.dto.*;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.event.MemberEvent;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.member.service.MemberService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Member관련 업무를 수행하는 Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

    private static final Long MAIL_EXPIRES_IN = 300000L; // 5분
    private static final String SIGNUP_PREFIX = "signup: ";
    private static final String PASSWORD_PREFIX = "password: ";
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final String PROFILE_IMAGE_PATH = "profile-images";

    private final MemberRepository memberRepository;
    private final MailComponents mailComponents;
    private final RedisTemplate<String, String> redisTemplate;
    private final S3Uploader s3Uploader;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final HttpServletRequest httpServletRequest;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${default_image}")
    String defaultImage;

    /**
     * 회원가입 처리를 수행하는 메소드
     */
    @Override
    public ResultDTO<SuccessDTO> signup(SignupDTO signupDTO, MultipartFile file) {
        validateSignup(signupDTO);

        String imageUrl = uploadProfileImage(file);
        if(imageUrl == null) {
            imageUrl = defaultImage;
        }

        String encryptedPassword = bCryptPasswordEncoder.encode(signupDTO.getPassword());

        MemberDTO memberDTO = createMemberDTO(signupDTO, encryptedPassword, imageUrl);
        MemberEntity memberEntity = MemberEntity.toEntity(memberDTO);
        memberRepository.save(memberEntity);

        return createSuccessResult("회원 가입에 성공했습니다.");
    }

    /**
     * 회원가입 인증 메일 보내는 메소드
     */
    @Override
    public ResultDTO<SuccessDTO> signupSendMail(String email) {
        validateEmailNotRegistered(email);
        String code = generateRandomUUID();

        try {
            sendVerificationEmail(email, code, "BIBIM 회원가입 인증메일", SIGNUP_PREFIX);
            return createSuccessResult("메일을 보내는 것을 성공했습니다.");
        } catch (Exception e) {
            log.error("❌ Redis 저장 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.REDIS_CONNECTION_FAILED);
        }
    }

    /**
     * 인증 코드 확인하는 메소드
     */
    @Override
    public ResultDTO<SuccessDTO> checkMail(VerificationDTO verificationDTO) {
        String code = redisTemplate.opsForValue().get(SIGNUP_PREFIX + verificationDTO.getEmail());
        if (!verificationDTO.getCode().equals(code)) {
            throw new CustomException(ErrorCode.INVALID_EMAIL_CODE);
        }

        return createSuccessResult("인증에 성공했습니다.");
    }

    /**
     * 랜덤 UUID 생성을 위한 static 메소드
     */
    public static String generateRandomUUID() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }

    /**
     * 회원 정보 조회
     */
    @Override
    public ResultDTO<MyInfoDTO> myInfo() {
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = findMemberByEmail(email);

        MyInfoDTO myInfoDTO = MyInfoDTO.builder()
                .success(true)
                .email(member.getEmail())
                .name(member.getName())
                .nationality(member.getNationality())
                .language(member.getLanguage())
                .profileImage(member.getProfileImage())
                .regDate(member.getRegDate())
                .build();

        return ResultDTO.of("회원 정보 조회에 성공했습니다.", myInfoDTO);
    }

    /**
     * 로그아웃 처리
     */
    @Override
    public ResultDTO<SuccessDTO> logout() {
        String email = AuthUtil.getLoginUserId();
        updateLoginStatus(email, false, LocalDateTime.now());

        String accessToken = jwtTokenProvider.getJwtFromRequest(httpServletRequest);
        blacklistAccessToken(accessToken);
        redisTemplate.delete(email + ": refreshToken");

        return createSuccessResult("로그아웃에 성공했습니다.");
    }

    /**
     * 회원 정보를 수정하는 메소드
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> updateInfo(UpdateInfoDTO updateInfoDTO, MultipartFile file) {
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = findMemberByEmail(email);

        updateMemberInfo(member, updateInfoDTO);
        updateProfileImage(member, file);
        memberRepository.save(member);

        publishMemberEvent(member, "member_update");

        return createSuccessResult("회원 정보가 성공적으로 수정되었습니다.");
    }

    /**
     * 비밀번호 변경 이메일 발송
     */
    @Override
    public ResultDTO<SuccessDTO> sendChangePasswordMail(String email) {
        String code = generateRandomUUID();
        sendVerificationEmail(email, code, "BIBIM 비밀번호 수정 인증메일", PASSWORD_PREFIX);
        return createSuccessResult("메일을 보내는 것을 성공했습니다.");
    }

    /**
     * 비밀번호 변경 처리
     */
    @Override
    public ResultDTO<SuccessDTO> changePassword(ChangePasswordDTO changePasswordDTO) {
        MemberEntity member = findMemberByEmail(changePasswordDTO.getEmail());
        validatePasswordCode(changePasswordDTO);

        String password = bCryptPasswordEncoder.encode(changePasswordDTO.getPassword());
        member.setPassword(password);
        memberRepository.save(member);

        publishMemberEvent(member, "password_update");

        return createSuccessResult("비밀번호 변경에 성공했습니다.");
    }

    /**
     * 회원 탈퇴 처리
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> withdraw(MemberDTO memberDTO) {
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = findMemberByEmail(email);

        if (!bCryptPasswordEncoder.matches(memberDTO.getPassword(), member.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        memberRepository.delete(member);
        return createSuccessResult("회원탈퇴가 완료되었습니다.");
    }

    /**
     * 로그인 상태 업데이트
     */
    @Override
    @Transactional
    public void updateLoginStatus(String userEmail, boolean status, LocalDateTime lastActiveTime) {
        MemberEntity member = findMemberByEmail(userEmail);

        member.setLoginStatus(status);
        member.setLastActiveTime(lastActiveTime);
        memberRepository.save(member);

        log.info("🔹 DB 업데이트 완료: userEmail={}, loginStatus={}, lastActiveTime={}",
                userEmail, status, lastActiveTime);
    }

    /**
     * 로그인 상태 조회
     */
    @Override
    public MemberLoginStatusDTO getLoginStatus(String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) {
            return new MemberLoginStatusDTO("", false, null);
        }

        Optional<MemberEntity> optionalMember = memberRepository.findByEmail(userEmail);
        if (optionalMember.isPresent()) {
            MemberEntity member = optionalMember.get();
            return new MemberLoginStatusDTO(member.getEmail(), member.isLoginStatus(), member.getLastActiveTime());
        }

        return new MemberLoginStatusDTO(userEmail, false, null);
    }

    // ========================= 유틸리티 메서드 =========================

    private void validateSignup(SignupDTO signupDTO) {
        if (!signupDTO.isEmailCheck()) {
            throw new CustomException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        log.info("🚀 회원가입 요청: {}", signupDTO);
    }

    private String uploadProfileImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.info("📷 받은 파일: 파일 없음");
            return null;
        }

        log.info("📷 받은 파일: {}", file.getOriginalFilename());
        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());

        if (fileExtension == null || !ALLOWED_IMAGE_EXTENSIONS.contains(fileExtension.toLowerCase())) {
            log.warn("⚠️ 지원하지 않는 이미지 형식입니다.");
            throw new CustomException(ErrorCode.UN_SUPPORTED_IMAGE_TYPE);
        }

        try {
            String imageUrl = s3Uploader.upload(file, PROFILE_IMAGE_PATH);
            log.info("✅ 업로드 완료: {}", imageUrl);
            return imageUrl;
        } catch (Exception e) {
            log.error("❌ S3 업로드 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
        }
    }

    private MemberDTO createMemberDTO(SignupDTO signupDTO, String encodedPassword, String imageUrl) {
        return MemberDTO.builder()
                .email(signupDTO.getEmail())
                .password(encodedPassword)
                .name(signupDTO.getName())
                .nationality(signupDTO.getNationality())
                .language(signupDTO.getLanguage())
                .socialLoginCheck("없음")
                .profileImage(imageUrl)
                .build();
    }

    private ResultDTO<SuccessDTO> createSuccessResult(String message) {
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        return ResultDTO.of(message, successDTO);
    }

    private void validateEmailNotRegistered(String email) {
        if (memberRepository.findByEmail(email).isPresent()) {
            throw new CustomException(ErrorCode.EMAIL_DUPLICATE);
        }
    }

    private void sendVerificationEmail(String email, String code, String title, String redisKeyPrefix) {
        String message = "<h3>5분안에 인증번호를 입력해주세요</h3> <br>" +
                "<h1>" + code + "</h1>";

        // 기존 코드가 있다면 삭제
        if (redisTemplate.opsForValue().get(redisKeyPrefix + email) != null) {
            redisTemplate.delete(redisKeyPrefix + email);
        }

        // 메일 전송
        mailComponents.sendMail(email, title, message);

        // Redis에 저장
        redisTemplate.opsForValue().set(redisKeyPrefix + email, code, MAIL_EXPIRES_IN, TimeUnit.MILLISECONDS);
    }

    private MemberEntity findMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));
    }

    private void blacklistAccessToken(String accessToken) {
        long expiration = jwtTokenProvider.getExpiration(accessToken);
        long now = (new Date()).getTime();
        long accessTokenExpiresIn = expiration - now;
        redisTemplate.opsForValue()
                .set(accessToken, "logout", accessTokenExpiresIn, TimeUnit.MILLISECONDS);
    }

    private void updateMemberInfo(MemberEntity member, UpdateInfoDTO updateInfoDTO) {
        if (updateInfoDTO.getName() != null) {
            member.setName(updateInfoDTO.getName());
        }
        if (updateInfoDTO.getNationality() != null) {
            member.setNationality(updateInfoDTO.getNationality());
        }
        if (updateInfoDTO.getLanguage() != null) {
            member.setLanguage(updateInfoDTO.getLanguage());
        }
    }

    private void updateProfileImage(MemberEntity member, MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            try {
                // 기존 이미지가 있을 시 삭제
                if (member.getProfileImage() != null && !member.getProfileImage().isEmpty()) {
                    s3Uploader.deleteFile(member.getProfileImage());
                }

                // 새 이미지 업로드
                String fileName = s3Uploader.upload(file, PROFILE_IMAGE_PATH);
                member.setProfileImage(fileName);
            } catch (IOException e) {
                throw new CustomException(ErrorCode.IMAGE_EXCEPTION);
            }
        }
    }

    private void publishMemberEvent(MemberEntity member, String eventType) {
        eventPublisher.publishEvent(new MemberEvent(member, member.getEmail(), member.getName(), eventType));
    }

    private void validatePasswordCode(ChangePasswordDTO changePasswordDTO) {
        String storedCode = redisTemplate.opsForValue().get(PASSWORD_PREFIX + changePasswordDTO.getEmail());
        if (!changePasswordDTO.getCode().equals(storedCode)) {
            throw new CustomException(ErrorCode.INVALID_EMAIL_CODE);
        }
    }
}