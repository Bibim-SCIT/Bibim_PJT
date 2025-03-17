package net.scit.backend.jwt;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import net.scit.backend.member.dto.TokenDTO;

@Component
public class JwtTokenProvider {

    private static final long ACCESS_TOKEN_EXPIRATION_TIME = 7200000; // Access Token: 2시간
    private static final long REFRESH_TOKEN_EXPIRATION_TIME = 86400000L; // Refresh Token: 24시간

    private final Key key;

    /**
     * 생성자에서 Secret Key 초기화
     *
     * @param secretKey application.yml에서 주입받은 Secret Key
     */
    public JwtTokenProvider(@Value("${secret_key}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 사용자 이름을 기반으로 AccessToken과 RefreshToken 생성
     *
     * @param username 사용자 이름
     * @return 생성된 TokenDTO 객체
     */
    public TokenDTO generateToken(String username) {
        String accessToken = createToken(username, ACCESS_TOKEN_EXPIRATION_TIME, "access");
        String refreshToken = createToken(username, REFRESH_TOKEN_EXPIRATION_TIME, "refresh");

        return TokenDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * JWT 토큰 생성
     *
     * @param username 사용자 이름
     * @param expirationTime 만료 시간
     * @param tokenType 토큰 타입 (access, refresh)
     * @return 생성된 토큰 문자열
     */
    private String createToken(String username, long expirationTime, String tokenType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("token_type", tokenType)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * HTTP 요청에서 JWT 토큰 추출
     *
     * @param request HTTP 요청 객체
     * @return 추출된 JWT 토큰 또는 null
     */
    public String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        return (bearerToken != null && bearerToken.startsWith("Bearer ")) ? bearerToken.substring(7) : null;
    }

    /**
     * 토큰에서 사용자 이메일 추출
     *
     * @param token JWT 토큰
     * @return 이메일 주소
     */
    public String getEmailFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * 토큰에서 사용자 이름 추출
     *
     * @param token JWT 토큰
     * @return 사용자 이름
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * JWT 토큰의 유효성 검사
     *
     * @param token 검사할 JWT 토큰
     * @return 유효하면 true, 아니면 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * JWT 토큰의 남은 유효 시간 확인
     *
     * @param token JWT 토큰
     * @return 남은 시간 (밀리초), 음수일 경우 0 반환
     */
    public Long getExpiration(String token) {
        Date expiration = getClaimsFromToken(token).getExpiration();
        long timeToExpire = expiration.getTime() - System.currentTimeMillis();
        return Math.max(0L, timeToExpire);
    }

    /**
     * JWT 토큰에서 Claims 추출
     *
     * @param token JWT 토큰
     * @return Claims 객체
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
