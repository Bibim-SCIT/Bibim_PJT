//package net.scit.backend.member.service;
//
//import lombok.RequiredArgsConstructor;
//import net.scit.backend.auth.JwtTokenProvider;
//import net.scit.backend.member.dto.TokenDTO;
//import org.springframework.stereotype.Service;
//import org.springframework.web.reactive.function.client.WebClient;
//import org.springframework.beans.factory.annotation.Value;
//import reactor.core.publisher.Mono;
//
//@Service
//@RequiredArgsConstructor
//public class GoogleService {
//
//    private final WebClient.Builder webClientBuilder;
//    private final JwtTokenProvider jwtTokenProvider;
//
//    @Value("${spring.security.oauth2.client.registration.google.client-id}")
//    private String clientId;
//
//    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
//    private String clientSecret;
//
//    // 구글에서 인증 코드를 사용해 accessToken을 요청
//    public String getAccessToken(String code) {
//        return webClientBuilder.baseUrl("https://oauth2.googleapis.com")
//                .build()
//                .post()
//                .uri("/token")
//                .header("Content-Type", "application/x-www-form-urlencoded")
//                .bodyValue("code=" + code +
//                        "&client_id=" + clientId +
//                        "&client_secret=" + clientSecret +
//                        "&redirect_uri=http://localhost:8080/login/oauth2/code/google" +
//                        "&grant_type=authorization_code")
//                .retrieve()
//                .bodyToMono(String.class)  // 응답을 String으로 받음
//                .block();  // 비동기 처리를 동기적으로 변환
//    }
//
//    // accessToken을 사용하여 구글 사용자 정보를 가져옴
//    public String getGoogleUserInfo(String accessToken) {
//        return webClientBuilder.baseUrl("https://www.googleapis.com")
//                .build()
//                .get()
//                .uri("/oauth2/v3/userinfo") // 사용자 정보 API 경로
//                .header("Authorization", "Bearer " + accessToken) // Authorization 헤더에 Bearer Token 추가
//                .retrieve()
//                .bodyToMono(String.class) // 응답을 String으로 반환
//                .block(); // 비동기 처리를 동기 방식으로 변환
//    }
//
//    // 구글 사용자 정보(email)를 기반으로 JWT 토큰 생성
//    public TokenDTO generateJwtToken(String accessToken) {
//        // accessToken을 통해 구글 사용자 정보(email) 추출
//        String googleUserInfo = getGoogleUserInfo(accessToken);
//        String email = extractEmailFromGoogleUserInfo(googleUserInfo); // Google API 응답에서 이메일 추출
//
//        // 이메일을 기반으로 JWT 토큰을 생성
//        return jwtTokenProvider.generateToken(email);
//    }
//
//    // 구글 사용자 정보에서 이메일을 추출하는 메서드 (예: JSON 파싱)
//    private String extractEmailFromGoogleUserInfo(String googleUserInfo) {
//        // 예시로 email을 JSON에서 파싱하는 방식
//        // 실제로는 JSON을 파싱하여 이메일 값을 추출해야 함
//        // 간단한 방법으로는 문자열에서 이메일을 추출할 수 있음
//
//        // 예시로 이메일 추출 (JSON 파싱 라이브러리 필요)
//        // String email = ...;
//
//        // 여기서는 단순히 email 값을 리턴한다고 가정
//        return "user@example.com";  // 실제로는 JSON에서 파싱된 이메일 값이어야 함
//    }
//}
