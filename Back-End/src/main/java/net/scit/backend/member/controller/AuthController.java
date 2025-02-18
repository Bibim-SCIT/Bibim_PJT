//package net.scit.backend.member.controller;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import jakarta.servlet.http.HttpServletResponse;
//import net.scit.backend.auth.JwtTokenProvider;
//import net.scit.backend.member.dto.TokenDTO;
//import net.scit.backend.member.service.GoogleService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationToken;
//import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.web.bind.annotation.*;
//
//import java.io.IOException;
//import java.util.Collections;
//import java.util.Map;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/auth")
//public class AuthController {
//
//    private final GoogleService googleService;
//    private final JwtTokenProvider jwtTokenProvider;
//
//    @Autowired
//    public AuthController(GoogleService googleService, JwtTokenProvider jwtTokenProvider) {
//        this.googleService = googleService;
//        this.jwtTokenProvider = jwtTokenProvider;
//    }
//
//    @GetMapping("/google")
//    public void redirectToGoogle(HttpServletResponse response) throws IOException {
//        String state = UUID.randomUUID().toString();
//        String clientId = "874993133895-bol28o6ebhsgerrtiripu6njccbf3pun.apps.googleusercontent.com";
//        String googleLoginUrl = "https://accounts.google.com/o/oauth2/auth?client_id=" + clientId +
//                "&redirect_uri=http://localhost:8080/login/oauth2/code/google" +
//                "&response_type=code&scope=email%20profile%20openid" +  // 'openid' 추가
//                "&state=" + state;
//        response.sendRedirect(googleLoginUrl);
//    }
//
//    @GetMapping("/login/oauth2/code/google")
//    public String googleCallback(@RequestParam String code, @RequestParam String state) {
//        // 받은 인증 코드로 accessToken을 얻음
//        String accessToken = googleService.getAccessToken(code);
//
//        // accessToken을 사용하여 사용자 정보를 가져옴 (JSON 응답을 Map으로 변환)
//        String userInfoJson = googleService.getGoogleUserInfo(accessToken);
//
//        // userInfoJson을 Map으로 변환 (예시: 이메일, 이름을 파싱)
//        Map<String, Object> userInfo = parseJsonToMap(userInfoJson);
//
//        // 사용자 정보에서 필요한 데이터를 추출
//        String email = (String) userInfo.get("email");
//        String name = (String) userInfo.get("name");
//
//        // OAuth2User 생성
//        OAuth2User oAuth2User = new DefaultOAuth2User(
//                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
//                userInfo, "email");
//
//        // OAuth2 인증을 위한 토큰 생성
//        UsernamePasswordAuthenticationToken authenticationToken =
//                new UsernamePasswordAuthenticationToken(oAuth2User, null, oAuth2User.getAuthorities());
//
//         //Spring Security 컨텍스트에 인증 설정
//         SecurityContextHolder.getContext().setAuthentication(authenticationToken);
//
//        // JWT 토큰 발급
//        TokenDTO tokenDTO = jwtTokenProvider.generateToken(email);
//
//        return "Google 로그인 성공, 사용자 정보: " + userInfo;
//    }
//
//    private Map<String, Object> parseJsonToMap(String json) {
//        try {
//            ObjectMapper objectMapper = new ObjectMapper();
//            return objectMapper.readValue(json, Map.class);
//        } catch (JsonProcessingException e) {
//            e.printStackTrace();
//            return Collections.emptyMap();
//        }
//    }
//}
