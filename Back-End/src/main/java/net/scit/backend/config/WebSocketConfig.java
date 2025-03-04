package net.scit.backend.config;

import net.scit.backend.auth.JwtTokenProvider;
import net.scit.backend.channel.session.WebSocketSessionManager;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final JwtTokenProvider jwtTokenProvider;
    private final WebSocketSessionManager sessionManager;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new CustomWebSocketHandler(jwtTokenProvider, sessionManager), "/ws/chat")
                .setAllowedOrigins("*") // 필요하면 허용 도메인 변경
                .withSockJS();
    }
}
