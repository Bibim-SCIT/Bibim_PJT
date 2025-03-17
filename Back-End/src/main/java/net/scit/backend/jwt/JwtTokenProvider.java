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

    // 토큰 만료 시간 상수
    private static final long ACCESS_TOKEN_EXPIRATION_TIME = 7200000; // 2시간 (밀리초)
    private static final long REFRESH_TOKEN_EXPIRATION_TIME = 86400000L; // 24시간 (밀리초)

    // 토큰 서명에 사용할 Secret Key
    private final Key key;

    /**
     * 생성자: Secret Key를 초기화
     *
     * @param secretKey application.yml에서 설정된 secret 값을 주입
     */
    public JwtTokenProvider(@Value("${secret_key}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 사용자 이름을 기반으로 AccessToken과 RefreshToken을 생성
     *
     * @param username 사용자 이름
     * @return TokenDTO (AccessToken 및 RefreshToken 포함)
     */
    public TokenDTO generateToken(String username) {
        String accessToken = createToken(username, ACCESS_TOKEN_EXPIRATION_TIME, "access");
        String refreshToken = createToken(username, REFRESH_TOKEN_EXPIRATION_TIME, "refresh");

        // ✅ 빌더 패턴을 사용해 TokenDTO 생성
        return TokenDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * JWT 토큰 생성 메서드
     *
     * @param username 사용자 이름
     * @param expirationTime 토큰 만료 시간
     * @param tokenType 토큰 유형 (access 또는 refresh)
     * @return 생성된 JWT 토큰 문자열
     */
    private String createToken(String username, long expirationTime, String tokenType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now) // 생성 시간
                .setExpiration(expiryDate) // 만료 시간
                .claim("token_type", tokenType) // 추가 클레임 지정
                .signWith(key, SignatureAlgorithm.HS256) // HMAC-SHA256 서명
                .compact();
    }

    /**
     * 요청에서 JWT 토큰을 추출
     *
     * @param request HTTP 요청 객체
     * @return 추출된 JWT 토큰 또는 null
     */
    public String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 이후 토큰 값 반환
        }
        return null;
    }


    /**
     * 토큰에서 이메일 추출
     * @param token
     * @return
     */
    public String getEmailFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject(); // subject에 이메일 저장
    }


    /**
     * JWT 토큰에서 사용자 이름 추출
     *
     * @param token JWT 토큰
     * @return 사용자 이름
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject(); // Claim에서 Subject 추출
    }

    /**
     * 주어진 JWT 토큰이 유효한지 검사
     *
     * @param token 검사할 JWT 토큰
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); // 토큰 파싱 및 검증
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // JWT 관련 예외 또는 잘못된 입력 처리
            System.out.println("❌ 유효하지 않은 JWT 토큰: " + e.getMessage());
        }
        return false;
    }

    /**
     * JWT 토큰의 만료 시간 가져오기
     *
     * @param token JWT 토큰
     * @return 남은 토큰 유효 시간 (밀리초), 최소 0 이상의 값 반환
     */
    public Long getExpiration(String token) {
        Date expiration = getClaimsFromToken(token).getExpiration();
        long timeToExpire = expiration.getTime() - new Date().getTime();
        // 음수가 나오면 0을 반환
        return Math.max(0L, timeToExpire);
    }

    /**
     * JWT 토큰에서 Claims(클레임) 추출
     *
     * @param token JWT 토큰
     * @return Claims 객체
     */
    public Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key) // 서명 키 설정
                    .build()
                    .parseClaimsJws(token) // 토큰 파싱
                    .getBody(); // Claims 객체 반환
        } catch (ExpiredJwtException e) {
            System.out.println("⏰ JWT 토큰이 만료되었습니다.");
            throw e;
        } catch (MalformedJwtException | IllegalArgumentException e) {
            System.out.println("❌ JWT 토큰이 잘못되었습니다.");
            throw e;
        }
    }
}