package net.scit.backend.oauth.service.impl;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.JwtTokenProvider;
import net.scit.backend.member.dto.TokenDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.oauth.dto.GoogleDTO;
import net.scit.backend.oauth.service.OAuthService;

@Service
@RequiredArgsConstructor
public class OAuthServiceImpl implements OAuthService {

    private static final long LINK_EXPIRES_MILLIS = 300000L; // 링크 요청 만료 시간 (5분)
    private static final String OAUTH_LINK_PREFIX = "oauth_link_"; // Redis 키 프리픽스
    private static final String REFRESH_TOKEN_SUFFIX = ": refreshToken"; // Redis 토큰 키 접미사
    private static final String NONE = "없음"; // 소셜 연동 없음 상태
    private static final String GOOGLE = "google"; // Google 소셜 로그인 구분자

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    /**
     * 구글 로그인 처리
     */
    @Override
    public ResultDTO<TokenDTO> googleLogin(GoogleDTO googleDTO) {
        String email = googleDTO.getEmail();
        return memberRepository.findByEmail(email)
                .map(member -> handleExistingMember(member, googleDTO))
                .orElseGet(() -> saveNewMember(googleDTO, GOOGLE));
    }

    /**
     * 기존 회원 로그인 처리
     */
    private ResultDTO<TokenDTO> handleExistingMember(MemberEntity member, GoogleDTO googleDTO) {
        if (!NONE.equals(member.getSocialLoginCheck())) {
            return createToken(member); // 이미 소셜 연동된 경우 바로 토큰 생성
        }

        String linked = redisTemplate.opsForValue().get(OAUTH_LINK_PREFIX + member.getEmail());
        if ("true".equals(linked)) {
            redisTemplate.delete(OAUTH_LINK_PREFIX + member.getEmail());
            return updateExistingMember(member, googleDTO, GOOGLE);
        }

        throw new CustomException(ErrorCode.UNLINKED_MEMBER); // 연동되지 않은 경우 예외 처리
    }

    /**
     * JWT 토큰 생성 및 Redis에 저장
     */
    private ResultDTO<TokenDTO> createToken(MemberEntity member) {
        String email = member.getEmail();
        String redisKey = email + REFRESH_TOKEN_SUFFIX;
        TokenDTO tokenDTO = jwtTokenProvider.generateToken(email);
        String refreshToken = tokenDTO.getRefreshToken();

        // 기존 토큰이 있으면 삭제 후 새 토큰 저장
        redisTemplate.delete(redisKey);
        long refreshTokenExpiresIn = jwtTokenProvider.getExpiration(refreshToken) - new Date().getTime();

        if (refreshTokenExpiresIn <= 0) {
            refreshTokenExpiresIn = 3600000; // 기본 1시간 설정
        }

        redisTemplate.opsForValue().set(redisKey, refreshToken, refreshTokenExpiresIn, TimeUnit.MILLISECONDS);

        return ResultDTO.of("로그인에 성공했습니다.", tokenDTO);
    }

    /**
     * 기존 회원 정보 업데이트 후 토큰 발급
     */
    private ResultDTO<TokenDTO> updateExistingMember(MemberEntity member, GoogleDTO googleDTO, String snsName) {
        MemberEntity updatedMember = member.toBuilder()
                .name(googleDTO.getName())
                .socialLoginCheck(snsName)
                .build();

        memberRepository.save(updatedMember);
        return createToken(updatedMember);
    }

    /**
     * 신규 회원 저장 후 토큰 발급
     */
    private ResultDTO<TokenDTO> saveNewMember(GoogleDTO googleDTO, String snsName) {
        String encodedPassword = bCryptPasswordEncoder.encode(UUID.randomUUID().toString().replace("-", ""));

        MemberEntity newMember = MemberEntity.builder()
                .email(googleDTO.getEmail())
                .password(encodedPassword)
                .name(googleDTO.getName())
                .nationality("KR")
                .language("ko")
                .profileImage(googleDTO.getPicture())
                .socialLoginCheck(snsName)
                .regDate(LocalDate.now())
                .build();

        memberRepository.save(newMember);
        return createToken(newMember);
    }

    /**
     * 소셜 계정 연동 처리
     */
    @Override
    public ResultDTO<SuccessDTO> linkAccount(String email, boolean linkYn) {
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        if (!NONE.equals(member.getSocialLoginCheck())) {
            throw new CustomException(ErrorCode.OAUTH_ALREADY_LINKED);
        }

        redisTemplate.opsForValue().set(
                OAUTH_LINK_PREFIX + email,
                String.valueOf(linkYn),
                LINK_EXPIRES_MILLIS,
                TimeUnit.MILLISECONDS
        );

        return ResultDTO.of("연동 요청에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }
}
