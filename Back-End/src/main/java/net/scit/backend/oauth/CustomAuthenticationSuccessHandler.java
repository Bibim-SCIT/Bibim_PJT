package net.scit.backend.oauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.JwtTokenProvider;
import net.scit.backend.member.dto.TokenDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper; // JSON 변환용
    private final RedisTemplate<String, String> redisTemplate;

    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // oAuth2User 객체 가져오기
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

        // 사용자 정보 가져오기
        String email = oAuth2User.getEmail();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 토큰 생성
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
        redisTemplate.opsForValue().set(email + ": refreshToken", refreshToken, refreshTokenExpiresIn, TimeUnit.MILLISECONDS);

        // ResponseEntity로 응답을 반환하는 방식으로 변경
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // ResultDTO 형식으로 응답 본문 작성
        ResultDTO<TokenDTO> result = ResultDTO.of("로그인에 성공했습니다.", tokenDTO);
        objectMapper.writeValue(response.getWriter(), result);  // JSON 형태로 응답에 작성
    }
}
