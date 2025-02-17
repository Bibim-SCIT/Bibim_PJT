package net.scit.backend.member.service;

import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.member.dto.LoginMemberDetail;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.BadCredentialsException;
import net.scit.backend.auth.JwtTokenProvider;
import net.scit.backend.member.dto.TokenDTO;

import javax.xml.transform.Result;

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
    public ResultDTO<TokenDTO> login(String email, String password) {
        // 사용자 정보 조회
        MemberEntity memberEntity = memberRepository.findById(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, memberEntity.getPassword())) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        // JWT 토큰 생성
        TokenDTO tokenDTO = jwtTokenProvider.generateToken(email);
        String accessToken = tokenDTO.getAccessToken();
        
        // 토큰 발급 로깅 추가
        log.info("사용자 {} 에게 토큰이 발급되었습니다. 토큰: {}", email, accessToken);

        return ResultDTO.of("로그인에 성공했습니다.", tokenDTO);
    }
}