package net.scit.backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import net.scit.backend.jwt.JwtAuthenticationFilter;
import net.scit.backend.jwt.JwtTokenProvider;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final RedisTemplate<String, String> redisTemplate;

    @Lazy
    @Autowired
    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
<<<<<<< HEAD
                          UserDetailsService userDetailsService,
                          RedisTemplate<String, String> redisTemplate) {
      
=======
            UserDetailsService userDetailsService,
            RedisTemplate<String, String> redisTemplate,
            CustomOAuth2UserService customOAuth2UserService,
            CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler,
            CustomOAuth2FailureHandler customOAuth2FailureHandler) {

>>>>>>> 5cee0926e48ee5edd9dc9450490fe59c011500bd
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.redisTemplate = redisTemplate;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // ✅ SSE 사용을 위해 CSRF 비활성화
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // ✅ JWT
                                                                                                              // 기반 세션
                                                                                                              // 관리
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/members/check-email", "/members/signup/",
                                "/members/signup/**",
                                "/members/login",
                                "/members/signup/send-mail", // ✅ 이메일 인증 요청 허용
                                "/members/signup/check-mail", // ✅ 인증 코드 확인 요청 허용
                                "/members/link",
                                "/oauth2/google",
                                "/workdata/**", // 자료실 관련(추후 삭제)
                                "/workspace/**",
                                "/ws/**",
                                "/error")
                        .permitAll() // 로그인 엔드포인트 허용
                        .requestMatchers("/admin/**").hasRole("ADMIN") // 관리자 전용
                        .requestMatchers("/user/**", "/schedule/**", "/members/myinfo", "/members/changeinfo",
                                "/members/withdraw",
                                "/workspace/**")
                        .hasRole("USER") // 사용자 전용
                        .requestMatchers("/notification/subscribe").permitAll() // ✅ SSE 구독 요청 허용
<<<<<<< HEAD
                        .requestMatchers("/notification/unread", "/notification/read-single",
                                "/notification/read-all", "/notification/delete").authenticated() // ✅ 알림 관련 API는 인증 필요
                        .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                )
=======
                        .requestMatchers("/notification/unread", "/notification/read-single", "/notification/read-all",
                                "/notification/delete")
                        .authenticated() // ✅ 알림 관련 API는 인증 필요
                        .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(customAuthenticationSuccessHandler)
                        .failureHandler(customOAuth2FailureHandler))
>>>>>>> 5cee0926e48ee5edd9dc9450490fe59c011500bd
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService, redisTemplate),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); // ✅ React 허용
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")); // ✅ 허용할 HTTP 메소드
        config.setAllowedHeaders(List.of("*")); // ✅ 모든 헤더 허용
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

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
