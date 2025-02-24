//package net.scit.backend.auth;
//
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.extern.slf4j.Slf4j;
//import net.scit.backend.member.entity.MemberEntity;
//import net.scit.backend.member.repository.MemberRepository;
//import net.scit.backend.member.dto.TokenDTO;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.oauth2.core.oidc.user.OidcUser;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//import java.io.IOException;
//import java.util.Optional;
//
//@Component
//@Slf4j
//public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {
//
//    @Autowired
//    private MemberRepository memberRepository; // 회원 DB 저장용 Repository
//
//    @Autowired
//    private JwtTokenProvider jwtTokenProvider; // JWT 토큰 생성용
//
//    // 프론트엔드에서 로그인 성공 후 이동할 URL (application.yml에 설정)
//    @Value("${app.frontend.success-url}")
//    private String frontendSuccessUrl;
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
//            throws IOException, ServletException {
//        log.debug("onAuthenticationSuccess() 호출됨. Authentication principal: {}", authentication.getPrincipal());
//
//        String email = null;
//        String name = null;
//        String socialId = null;
//
//        // OAuth2User 또는 OIDCUser 타입에 따라 사용자 정보 추출
//        Object principal = authentication.getPrincipal();
//        if (principal instanceof OidcUser) {
//            OidcUser oidcUser = (OidcUser) principal;
//            email = oidcUser.getEmail();
//            name = oidcUser.getFullName();
//            socialId = oidcUser.getSubject();
//            log.debug("OIDC 사용자 정보: email={}, name={}, socialId={}", email, name, socialId);
//        } else if (principal instanceof OAuth2User) {
//            OAuth2User oAuth2User = (OAuth2User) principal;
//            email = oAuth2User.getAttribute("email");
//            name = oAuth2User.getAttribute("name");
//            socialId = oAuth2User.getAttribute("sub"); // 고유 식별자
//            log.debug("OAuth2 사용자 정보: email={}, name={}, socialId={}", email, name, socialId);
//        }
//
//        // 회원 정보가 DB에 없으면 신규 등록 (한번 등록되면 변경하지 않음)
//        Optional<MemberEntity> optionalMember = memberRepository.findById(email);
//        if (optionalMember.isEmpty()) {
//            log.debug("DB에 해당 회원이 존재하지 않음. 신규 회원 등록 진행: email={}", email);
//            MemberEntity newMember = MemberEntity.builder()
//                    .email(email)
//                    .name(name)
//                    .socialLoginCheck("google")
//                    .socialLoginId(socialId)
//                    .build();
//            memberRepository.save(newMember);
//            log.debug("신규 회원 등록 완료: {}", newMember);
//        } else {
//            log.debug("DB에 이미 등록된 회원: {}", optionalMember.get());
//        }
//
//
//        // JWT 토큰 생성 (여기서는 email을 subject로 사용)
//        log.debug("JWT 토큰 생성 시작, subject(email): {}", email);
//        TokenDTO tokenDTO = jwtTokenProvider.generateToken(email);
//        log.debug("JWT 토큰 생성 완료: accessToken={}, refreshToken={}", tokenDTO.getAccessToken(), tokenDTO.getRefreshToken());
//
//        // 프론트엔드의 로그인 성공 URL로 JWT 토큰 전달 (쿼리 파라미터 방식)
//        String redirectUrl = frontendSuccessUrl + "?accessToken=" + tokenDTO.getAccessToken()
//                + "&refreshToken=" + tokenDTO.getRefreshToken();
//        log.debug("리다이렉트 URL: {}", redirectUrl);
//        response.sendRedirect(redirectUrl);
//    }
//}
