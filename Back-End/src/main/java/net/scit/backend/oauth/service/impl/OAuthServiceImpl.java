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
    private static final long LINK_EXPIRES_MILLIS = 300000L;
    private static final String OAUTH_LINK_PREFIX = "oauth_link_";
    private static final String REFRESH_TOKEN_SUFFIX = ": refreshToken";
    private static final String NONE = "없음";
    private static final String GOOGLE = "google";

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public ResultDTO<TokenDTO> googleLogin(GoogleDTO googleDTO) {
        String email = googleDTO.getEmail();
        return memberRepository.findByEmail(email)
                .map(member -> handleExistingMember(member, googleDTO))
                .orElseGet(() -> saveNewMember(googleDTO, GOOGLE));
    }

    private ResultDTO<TokenDTO> handleExistingMember(MemberEntity member, GoogleDTO googleDTO) {
        // 소셜 로그인 체크가 이미 되어 있는 경우
        if (!NONE.equals(member.getSocialLoginCheck())) {
            return createToken(member);
        }

        // 소셜 로그인 체크가 없는 경우 연결 동의 확인
        String linked = redisTemplate.opsForValue().get(OAUTH_LINK_PREFIX + member.getEmail());
        if ("true".equals(linked)) {
            redisTemplate.delete(OAUTH_LINK_PREFIX + member.getEmail());
            return updateExistingMember(member, googleDTO, GOOGLE);
        }

        // 동의하지 않은 경우
        throw new CustomException(ErrorCode.UNLINKED_MEMBER);
    }

    private ResultDTO<TokenDTO> createToken(MemberEntity member) {
        String email = member.getEmail();
        String redisKey = email + REFRESH_TOKEN_SUFFIX;

        TokenDTO tokenDTO = jwtTokenProvider.generateToken(email);
        String refreshToken = tokenDTO.getRefreshToken();

        // 기존 토큰이 있으면 삭제
        if (StringUtils.hasText(redisTemplate.opsForValue().get(redisKey))) {
            redisTemplate.delete(redisKey);
        }

        // 새 토큰 저장
        long refreshTokenExpiresIn = jwtTokenProvider.getExpiration(refreshToken) - new Date().getTime();

        // 만료 시간이 음수인 경우 처리
        if (refreshTokenExpiresIn <= 0) {
            System.out.println("토큰 만료 시간이 음수입니다. 기본값 1시간으로 설정합니다. 만료 시간: " + refreshTokenExpiresIn);
            refreshTokenExpiresIn = 3600000; // 1시간으로 기본값 설정
        }

        redisTemplate.opsForValue().set(redisKey, refreshToken, refreshTokenExpiresIn, TimeUnit.MILLISECONDS);

        return ResultDTO.of("로그인에 성공했습니다.", tokenDTO);
    }

    private ResultDTO<TokenDTO> updateExistingMember(MemberEntity member, GoogleDTO googleDTO, String snsName) {
        // 회원 정보 업데이트
        MemberEntity updatedMember = member.toBuilder()
                .name(googleDTO.getName())
                .socialLoginCheck(snsName)
                .build();

        memberRepository.save(updatedMember);
        return createToken(updatedMember);
    }

    private ResultDTO<TokenDTO> saveNewMember(GoogleDTO googleDTO, String snsName) {
        // 랜덤 비밀번호 생성 및 암호화
        String encodedPassword = bCryptPasswordEncoder.encode(
                UUID.randomUUID().toString().replace("-", ""));

        // 신규 회원 생성
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

    @Override
    public ResultDTO<SuccessDTO> linkAccount(String email, boolean linkYn) {
        // 회원 존재 여부 확인
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 이미 소셜 로그인과 연결되어 있는지 확인
        if (!NONE.equals(member.getSocialLoginCheck())) {
            throw new CustomException(ErrorCode.OAUTH_ALREADY_LINKED);
        }

        // Redis에 연동 정보 저장
        redisTemplate.opsForValue().set(
                OAUTH_LINK_PREFIX + email,
                String.valueOf(linkYn),
                LINK_EXPIRES_MILLIS,
                TimeUnit.MILLISECONDS
        );

        return ResultDTO.of("연동 요청에 성공했습니다.",
                SuccessDTO.builder().success(true).build());
    }
}