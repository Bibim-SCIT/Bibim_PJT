package net.scit.backend.jwt;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * JWT 인증을 위한 커스텀 Authentication 구현체
 * Spring Security의 AbstractAuthenticationToken을 상속받아 JWT 기반의 인증을 처리
 */
public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    // 인증된 사용자의 정보를 담는 principal 객체
    private final UserDetails principal;

    /**
     * JWT 인증 토큰 생성자
     * @param principal 인증된 사용자 정보 (UserDetails 객체)
     * @param credentials 자격 증명 (JWT 토큰의 경우 사용하지 않음)
     * @param authorities 사용자의 권한 목록
     */
    public JwtAuthenticationToken(UserDetails principal, Object credentials, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);  // 부모 클래스의 생성자 호출하여 권한 정보 설정
        this.principal = principal;  // 사용자 정보 설정
        setAuthenticated(true);  // 인증 완료 상태로 설정
    }

    /**
     * 자격 증명(credentials) 정보를 반환
     * JWT는 토큰 기반 인증이므로 별도의 자격 증명이 필요 없음
     * @return null (JWT에서는 사용하지 않음)
     */
    @Override
    public Object getCredentials() {
        return null;
    }

    /**
     * 인증된 사용자 정보(principal)를 반환
     * @return UserDetails 타입의 사용자 정보
     */
    @Override
    public UserDetails getPrincipal() {
        return principal;
    }
}

