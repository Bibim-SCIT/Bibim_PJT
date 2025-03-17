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

    /**
     * 필터링 로직 처리 메서드
     *
     * @param request  HTTP 요청 객체
     * @param response HTTP 응답 객체
     * @param chain    필터 체인
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (shouldFilter(request)) {
            try {
                authenticateRequest(request); // 요청 인증 처리
            } catch (CustomException e) {
                // Custom 예외 발생 시 응답에 상태 코드 설정
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
                return;
            }
        }
        chain.doFilter(request, response); // 다음 필터로 전달
    }

    /**
     * 필터링 대상 경로인지 확인
     *
     * @param request HTTP 요청 객체
     * @return 필터링이 필요한 경우 true 반환
     */
    private boolean shouldFilter(HttpServletRequest request) {
        return !isExcludedPath(request);
    }

    /**
     * 인증 제외 경로 확인
     *
     * @param request HTTP 요청 객체
     * @return 제외 대상 경로일 경우 true 반환
     */
    private boolean isExcludedPath(HttpServletRequest request) {
        return "/members/login".equals(request.getRequestURI());
    }

    /**
     * 요청에 대한 JWT 인증 처리
     *
     * @param request HTTP 요청 객체
     */
    private void authenticateRequest(HttpServletRequest request) {
        String token = jwtTokenProvider.getJwtFromRequest(request);
        if (isValidToken(token)) {
            authenticateUser(request, token);
        }
    }

    /**
     * JWT 토큰 유효성 검증 및 블랙리스트 확인
     *
     * @param token JWT 토큰
     * @return 유효하면 true 반환
     */
    private boolean isValidToken(String token) {
        return token != null && jwtTokenProvider.validateToken(token) && !isTokenBlacklisted(token) && !isRefreshToken(token);
    }

    /**
     * 토큰이 Redis 블랙리스트에 있는지 확인
     *
     * @param token JWT 토큰
     * @return 블랙리스트에 있으면 true 반환
     */
    private boolean isTokenBlacklisted(String token) {
        return !ObjectUtils.isEmpty(redisTemplate.opsForValue().get(token));
    }

    /**
     * 토큰이 리프레시 토큰인지 확인
     *
     * @param token JWT 토큰
     * @return 리프레시 토큰이면 true 반환
     */
    private boolean isRefreshToken(String token) {
        return "refresh".equals(jwtTokenProvider.getClaimsFromToken(token).get("token_type"));
    }

    /**
     * 사용자 인증 처리
     *
     * @param request HTTP 요청 객체
     * @param token   JWT 토큰
     */
    private void authenticateUser(HttpServletRequest request, String token) {
        String username = jwtTokenProvider.getUsernameFromToken(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (userDetails != null) {
            SecurityContextHolder.getContext().setAuthentication(createAuthentication(userDetails, request));
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
