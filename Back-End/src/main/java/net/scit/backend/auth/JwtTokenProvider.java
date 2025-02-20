package net.scit.backend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import net.scit.backend.member.dto.TokenDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Collections;
import java.util.Date;

@Component  // 스프링 컨테이너에 의해 자동으로 빈으로 등록되는 클래스
public class JwtTokenProvider {

    // 토큰의 만료 시간을 1일(24시간)으로 설정 (밀리초 단위: 24시간 * 60분 * 60초 * 1000밀리초)
    private final long ACCESS_TOKEN_EXPIRATION_TIME = 7200000;
    private final long REFRESH_TOKEN_EXPIRATION_TIME = 86400000L;

    private final Key key;

    // application.yml secret 값 가져와서 key에 저장
    public JwtTokenProvider(@Value("${secret_key}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 사용자 이름을 기반으로 JWT 토큰을 생성하는 메소드
     *
     * @param username 사용자 이름
     * @return 생성된 JWT 토큰 문자열
     */
    public TokenDTO generateToken(String username) {
        // AccessToken 클레임 설정
        Claims accessTokenClaims = Jwts.claims().setSubject(username);
        accessTokenClaims.put("roles", Collections.singletonList("ROLE_USER"));
        accessTokenClaims.put("token_type", "access");

        // RefreshToken 클레임 설정
        Claims refreshTokenClaims = Jwts.claims().setSubject(username);
        refreshTokenClaims.put("roles", Collections.singletonList("ROLE_USER"));
        refreshTokenClaims.put("token_type", "refresh");

        long now = (new Date()).getTime();
        Date accessTokenExpiresIn = new Date(now + ACCESS_TOKEN_EXPIRATION_TIME);
        Date refreshTokenExpiresIn = new Date(now + REFRESH_TOKEN_EXPIRATION_TIME);

        String accessToken = Jwts.builder()
                .setHeaderParam("type", "JWT")
                .setClaims(accessTokenClaims)
                .setIssuedAt(new Date(now))
                .setExpiration(accessTokenExpiresIn)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        String refreshToken = Jwts.builder()
                .setHeaderParam("type", "JWT")
                .setClaims(refreshTokenClaims)
                .setIssuedAt(new Date(now))
                .setExpiration(refreshTokenExpiresIn)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        return TokenDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * JWT 토큰에서 사용자 이름을 추출하는 메소드
     *
     * @param token JWT 토큰
     * @return 토큰에서 추출한 사용자 이름
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * JWT 토큰의 유효성을 검사하는 메소드
     *
     * @param token 검사할 JWT 토큰
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getExpiration(String token) {
        Claims claims = getClaimsFromToken(token);

        Date expirationDate = claims.getExpiration();

        return expirationDate.getTime();
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 요청에서 JWT 토큰을 추출하는 메서드
     *
     * @param request HTTP 요청 객체
     *               - getHeader("Authorization")로 인증 헤더 값 추출
     *               - 헤더 형식은 "Bearer {JWT토큰}" 형태여야 함
     *
     * @return String JWT 토큰 문자열 또는 null
     *         - 유효한 Bearer 토큰인 경우: JWT 토큰 문자열
     *         - 토큰이 없거나 잘못된 형식: null
     */
    public String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization"); // 요청 헤더에서 Authorization 값 가져오기
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) { // "Bearer "로 시작하면
            return bearerToken.substring(7); // "Bearer " 이후의 토큰 값만 추출하여 반환
        }
        return null; // 토큰이 없거나 잘못된 형식이면 null 반환
    }

}

