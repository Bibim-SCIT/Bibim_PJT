package net.scit.backend.config;

import lombok.RequiredArgsConstructor;
import net.scit.backend.auth.JwtAuthenticationFilter;
import net.scit.backend.auth.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtTokenProvider jwtTokenProvider;
        private final UserDetailsService userDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (JWT 사용 시 필요 없음)
                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers("/", "/members/check-email", "/members/signup/",
                                                                "/members/signup/**",
                                                                "/members/myinfo",
                                                                "/members/login",
                                                                "/error",
                                                                "/workspace/**")
                                                .permitAll() // 로그인 엔드포인트 허용
                                                .requestMatchers("/admin/**").hasRole("ADMIN") // 관리자 전용
                                                .requestMatchers("/user/**").hasRole("USER") // 사용자 전용
                                                .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                                )
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login?logout")
                                                .permitAll())
                                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService),
                                                UsernamePasswordAuthenticationFilter.class);

                http
                                .formLogin((auth) -> auth
                                                // .loginPage("/members/login")
                                                .loginProcessingUrl("/members/login")
                                                .usernameParameter("email")
                                                .passwordParameter("password")
                                                .defaultSuccessUrl("/members/loginsucess", true)
                                                // .failureUrl("/members/login?error=true")
                                                .permitAll());
                return http.build();
        }

        @Bean
        public BCryptPasswordEncoder bCryptPasswordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:3000")); // React 허용
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 허용할 HTTP 메소드
                config.setAllowedHeaders(List.of("*")); // 모든 헤더 허용
                config.setAllowCredentials(true); // 쿠키 허용

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
