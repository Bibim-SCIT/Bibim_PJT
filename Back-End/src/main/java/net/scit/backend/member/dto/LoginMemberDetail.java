package net.scit.backend.member.dto;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.*;
import net.scit.backend.member.entity.MemberEntity;

@Data
@Builder
public class LoginMemberDetail implements UserDetails 
{
    private String email;
    private String password;
    private String name;
    private String nationality;
    private String language;
    private boolean loginStatus;
    private String socialLoginCheck;
    private String roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(roles));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    // Entity를 받아서 LoginUserDetails을 반환하는 메소드 생성
	public static LoginMemberDetail toDTO(MemberEntity entity) {
		return LoginMemberDetail.builder()
				.email(entity.getEmail())
				.password(entity.getPassword())
				.name(entity.getName())
                .nationality(entity.getNationality())
                .language(entity.getLanguage())
                .loginStatus(entity.isLoginStatus())
                .socialLoginCheck(entity.getSocialLoginCheck())
				.roles(entity.getRoles())
				.build();
	}

}
