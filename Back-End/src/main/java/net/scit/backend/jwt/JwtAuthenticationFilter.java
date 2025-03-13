package net.scit.backend.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider; // JWT 토큰 처리 Provider
    private final UserDetailsService userDetailsService; // 사용자 정보 제공 Service
    private final RedisTemplate<String, String> redisTemplate; // Redis를 통한 토큰 관리

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            // 인증 제외 경로 처리
            if (isExcludedPath(request)) {
                chain.doFilter(request, response);
                return;
            }

            // 요청에서 JWT 토큰 추출
            String token = jwtTokenProvider.getJwtFromRequest(request);

            if (token != null && jwtTokenProvider.validateToken(token)) {
                // JWT 인증 수행
                processTokenAuthentication(request, token);
            }
        } catch (CustomException e) {
            logger.error("❌ JWT 인증 오류: " + e.getMessage());
        } catch (Exception e) {
            logger.error("❌ 필터 처리 중 오류 발생", e);
        }

        // 다음 필터로 요청 전달
        chain.doFilter(request, response);
    }

    /**
     * 인증 제외 경로 확인
     * 로그인 및 특정 엔드포인트를 필터링 대상에서 제외
     *
     * @param request HTTP 요청
     * @return 인증 제외 여부
     */
    private boolean isExcludedPath(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/members/login"); // 인증 제외 경로
    }

    /**
     * JWT 토큰 기반 인증 처리
     *
     * @param request HTTP 요청 객체
     * @param token   JWT 토큰
     */
    private void processTokenAuthentication(HttpServletRequest request, String token) {
        // 토큰 타입 확인 및 Redis 블랙리스트 체크
        validateTokenTypeAndBlacklist(token);

        String username = jwtTokenProvider.getUsernameFromToken(token); // 사용자명 추출
        UserDetails userDetails = userDetailsService.loadUserByUsername(username); // 사용자 데이터 조회

        if (userDetails != null) {
            // Spring Security Authentication 객체 생성 및 설정
            var authentication = createAuthentication(userDetails, request);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            logger.info("🟢 사용자 인증 완료: " + username);
        }
    }

    /**
     * 토큰 타입 확인 및 Redis 블랙리스트 검증
     *
     * @param token JWT 토큰
     */
    private void validateTokenTypeAndBlacklist(String token) {
        String tokenType = (String) jwtTokenProvider.getClaimsFromToken(token).get("token_type");

        if ("refresh".equals(tokenType)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        // Redis에서 BlackList 확인
        String isLogout = redisTemplate.opsForValue().get(token);
        if (!ObjectUtils.isEmpty(isLogout)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
    }

    /**
     * Spring Security Authentication 객체 생성
     *
     * @param userDetails 사용자 정보
     * @param request     HTTP 요청 객체
     * @return 생성된 Authentication 객체
     */
    private JwtAuthenticationToken createAuthentication(UserDetails userDetails, HttpServletRequest request) {
        JwtAuthenticationToken authentication =
                new JwtAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        return authentication;
    }
}