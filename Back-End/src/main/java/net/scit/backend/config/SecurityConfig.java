package net.scit.backend.config;

//import net.scit.backend.auth.CustomOAuth2SuccessHandler;
import net.scit.backend.auth.JwtAuthenticationFilter;
import net.scit.backend.auth.JwtTokenProvider;
// import net.scit.backend.member.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import net.scit.backend.member.service.MemberDetailsService;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
//    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;
    private final UserDetailsService userDetailsService;
    private final RedisTemplate<String, String> redisTemplate;

    @Lazy
    @Autowired
    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
//                          CustomOAuth2SuccessHandler customOAuth2SuccessHandler,
                            UserDetailsService userDetailsService,
                            RedisTemplate<String, String> redisTemplate) {
        this.jwtTokenProvider = jwtTokenProvider;
//        this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
        this.userDetailsService = userDetailsService;
        this.redisTemplate = redisTemplate;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http
//                                                  , CustomOAuth2SuccessHandler customOAuth2SuccessHandler
                                                    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (JWT 사용 시 필요 없음)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/members/check-email", "/members/signup/",
                                "/members/signup/**",
                                "/members/login",
                                "/members/signup/send-mail", // ✅ 이메일 인증 요청 허용
                                "/members/signup/check-mail", // ✅ 인증 코드 확인 요청 허용
//                                "/auth/login/oauth2/code/google","/favicon.ico", // OAuth2 콜백 URL 허용 추가
                                "/workdata/**", //자료실 관련(추후 삭제)
                                "/error"  )
                        .permitAll() // 로그인 엔드포인트 허용
                        .requestMatchers("/admin/**").hasRole("ADMIN") // 관리자 전용
                        .requestMatchers("/user/**", "/schedule/**","/members/myinfo","/members/changeinfo", "/members/withdraw").hasRole("USER") // 사용자 전용
                        .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                )
//                .oauth2Login(oauth2 -> oauth2
//                        .successHandler(customOAuth2SuccessHandler)  // 필드 주입된 것을 직접 사용
//                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService, redisTemplate),
                        UsernamePasswordAuthenticationFilter.class
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); // React 허용
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 허용할 HTTP 메소드
        config.setAllowedHeaders(List.of("*")); // 모든 헤더 허용
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    } // 쿠키 허용

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();

    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
