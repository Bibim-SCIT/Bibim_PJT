package net.scit.backend.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.member.dto.LoginMemberDetail;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.BadCredentialsException;
import net.scit.backend.member.dto.JwtToken;
import net.scit.backend.auth.JwtTokenProvider;
import net.scit.backend.member.dto.LoginResponse;

import java.util.ArrayList;
import java.util.Optional;

@Service
@Slf4j
public class MemberDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public MemberDetailsService(MemberRepository memberRepository, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        MemberEntity memberEntity = memberRepository.findById(email)
                .orElseThrow(() -> {
                    throw new UsernameNotFoundException("ID나 Password 존재하지 않음");
                });

        return LoginMemberDetail.toDTO(memberEntity);
    }

    /**
     * 로그인 처리 및 JWT 토큰 발급
     * @param email 사용자 이메일
     * @param password 사용자 비밀번호
     * @return 로그인 응답 정보
     */
    public LoginResponse login(String email, String password) {
        // 사용자 정보 조회
        MemberEntity memberEntity = memberRepository.findById(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, memberEntity.getPassword())) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateToken(email);
        
        // 토큰 발급 로깅 추가
        log.info("사용자 {} 에게 토큰이 발급되었습니다. 토큰: {}", email, accessToken);
        
        // LoginResponse 객체 생성 및 반환
        return LoginResponse.builder()
                .email(email)
                .accessToken(accessToken)
                .build();
    }
}