package net.scit.backend.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component  // 스프링 컨테이너에 의해 자동으로 빈으로 등록되는 클래스
public class JwtTokenProvider {

    // JWT 토큰 생성 및 검증에 사용되는 비밀키 (실제 운영 환경에서는 환경변수나 설정 파일로 관리해야 함)
    private final String SECRET_KEY = "d994ab06d63c1c2d325c73c6cc24afc33300f612d6a300311e79595fc58fad20";
    
    // 토큰의 만료 시간을 1일(24시간)으로 설정 (밀리초 단위: 24시간 * 60분 * 60초 * 1000밀리초)
    private final long EXPIRATION_TIME = 86400000L;

    /**
     * 사용자 이름을 기반으로 JWT 토큰을 생성하는 메소드
     * @param username 사용자 이름
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)        // 토큰 제목을 사용자 이름으로 설정
                .setIssuedAt(new Date())     // 토큰 발행 시간을 현재 시간으로 설정
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))  // 토큰 만료 시간 설정
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)  // HS256 알고리즘과 비밀키로 토큰 서명
                .compact();  // 토큰 생성 및 직렬화
    }

    /**
     * JWT 토큰에서 사용자 이름을 추출하는 메소드
     * @param token JWT 토큰
     * @return 토큰에서 추출한 사용자 이름
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)   // 비밀키를 사용하여 토큰 파서 초기화
                .parseClaimsJws(token)       // 토큰 파싱 및 검증
                .getBody()                   // 토큰의 클레임(내용) 추출
                .getSubject();               // 사용자 이름 반환
    }

    /**
     * JWT 토큰의 유효성을 검사하는 메소드
     * @param token 검사할 JWT 토큰
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);  // 토큰 파싱 시도
            return true;  // 파싱 성공 시 유효한 토큰으로 판단
        } catch (Exception e) {  // 토큰 파싱 실패 시 (만료, 변조된 토큰 등)
            return false;
        }
    }
}

