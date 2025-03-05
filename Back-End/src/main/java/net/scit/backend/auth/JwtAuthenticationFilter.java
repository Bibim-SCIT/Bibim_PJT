package net.scit.backend.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * JWT 인증을 수행하는 필터 클래스
 * - 모든 요청에서 JWT 토큰을 확인하고 인증된 사용자 정보를 설정
 * - Spring Security의 OncePerRequestFilter를 확장하여 한 요청당 한 번만 실행됨
 */
@RequiredArgsConstructor // final 필드를 자동으로 주입하는 Lombok 어노테이션
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider; // JWT 토큰을 생성 및 검증하는 Provider
    private final UserDetailsService userDetailsService; // 사용자 정보를 조회하는 Service
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * 요청이 들어올 때마다 실행되는 필터 메서드
     * 
     * @param request  HTTP 요청 객체. 클라이언트로부터의 요청 정보를 포함
     *                 - 헤더, 파라미터, URI 등의 요청 정보 접근 가능
     *                 - getHeader()로 Authorization 헤더 확인
     *                 - getRequestURI()로 요청 경로 확인
     * 
     * @param response HTTP 응답 객체. 클라이언트로 보낼 응답 정보를 설정
     *                 - 상태 코드, 헤더, 본문 등의 응답 정보 설정 가능
     * 
     * @param chain    필터 체인 객체. 다음 필터로 요청을 전달하는 역할
     *                 - doFilter()를 호출하여 다음 필터로 처리 위임
     *                 - 마지막 필터라면 실제 요청 처리기로 전달
     * 
     * @throws ServletException 서블릿 처리 중 발생할 수 있는 예외
     * @throws IOException      입출력 처리 중 발생할 수 있는 예외
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 로그인 요청(/auth/login)은 필터링하지 않고 다음 필터로 넘김
        // 나중에 재인증 api 추가하기
        if (request.getRequestURI().equals("/members/login")) {
            chain.doFilter(request, response);
            return;
        }

        // 요청에서 JWT 토큰을 가져옴
        String token = jwtTokenProvider.getJwtFromRequest(request);
        System.out.println("🟢 JWT 추출됨: " + token);

        // 토큰이 존재하고, 유효하면 사용자 정보를 SecurityContext에 저장
        if (token != null && jwtTokenProvider.validateToken(token)) {
            System.out.println("🟢 유효한 JWT 확인 완료");

            // refreshToken 일 때 요청을 차단
            String tokenType = (String) jwtTokenProvider.getClaimsFromToken(token).get("token_type");
            System.out.println("🟢 토큰 타입: " + tokenType);

            if (tokenType.equals("refresh")) {
                throw new CustomException(ErrorCode.INVALID_TOKEN);
            }

            // Redis에서 해당 토큰의 BlackList 여부 확인
            String isLogout = redisTemplate.opsForValue().get(token);

            // 로그아웃된 토큰이면 요청을 차단
            if (!ObjectUtils.isEmpty(isLogout)) {
                System.out.println("❌ 블랙리스트된 토큰 감지");
                throw new CustomException(ErrorCode.INVALID_TOKEN);
            }

            String username = jwtTokenProvider.getUsernameFromToken(token); // 토큰에서 사용자명 추출
            UserDetails userDetails = userDetailsService.loadUserByUsername(username); // 사용자 정보 조회

            if (userDetails != null) {
                // ✅ SecurityContext에 인증 정보 저장 확인 로그 추가
                System.out.println("🟢 JWT 인증 완료: " + username);

                // Spring Security의 Authentication 객체 생성
                var authentication = new JwtAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // 요청 정보를 인증 객체에 설정
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // SecurityContext에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);

                System.out.println("🟢 SecurityContextHolder에 인증 정보 저장 완료");
            }
        } else {
            System.out.println("❌ JWT 인증 실패: 토큰 없음 또는 유효하지 않음");
        }

        // 다음 필터로 요청 전달
        chain.doFilter(request, response);
    }
}
