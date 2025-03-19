package net.scit.backend.member.service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.jwt.JwtTokenProvider;
import net.scit.backend.member.dto.LoginMemberDetail;
import net.scit.backend.member.dto.TokenDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        MemberEntity memberEntity = memberRepository.findById(email)
                .orElseThrow(() -> {
                    throw new UsernameNotFoundException("ID나 Password 존재하지 않음");
                });

        return LoginMemberDetail.toDTO(memberEntity);
    }

    /**
     * 로그인 처리 및 JWT 토큰 발급
     * @param email 사용자 이메일
     * @param password 사용자 비밀번호
     * @return 로그인 응답 정보
     */
    public ResultDTO<TokenDTO> login(String email, String password) {
        // 사용자 정보 조회
        MemberEntity memberEntity = memberRepository.findById(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, memberEntity.getPassword())) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        // JWT 토큰 생성
        TokenDTO tokenDTO = jwtTokenProvider.generateToken(email);
        String accessToken = tokenDTO.getAccessToken();
        String refreshToken = tokenDTO.getRefreshToken();

        // Redis에 refreshToken이 있는지 확인 후 있으면 삭제 후 추가
        String existingToken = redisTemplate.opsForValue().get(email + ": refreshToken");
        if (existingToken != null && !existingToken.isEmpty()) {
            redisTemplate.delete(email + ": refreshToken");
        }

        long expiration = jwtTokenProvider.getExpiration(refreshToken);
        long now = (new Date()).getTime();
        long refreshTokenExpiresIn = expiration - now;

        // 만료 시간이 음수인 경우 처리
        if (refreshTokenExpiresIn <= 0) {
            log.warn("토큰 만료 시간이 음수입니다. 기본값 1시간으로 설정합니다. expiration: {}, now: {}, diff: {}",
                    expiration, now, refreshTokenExpiresIn);
            refreshTokenExpiresIn = 3600000; // 1시간으로 기본값 설정
        } else {
            log.info("토큰 만료 시간: {}ms", refreshTokenExpiresIn);
        }

        redisTemplate.opsForValue().set(email + ": refreshToken", refreshToken, refreshTokenExpiresIn, TimeUnit.MILLISECONDS);

        // 토큰 발급 로깅 추가
        log.info("사용자 {} 에게 토큰이 발급되었습니다. 토큰: {}", email, accessToken);

        return ResultDTO.of("로그인에 성공했습니다.", tokenDTO);
    }
}