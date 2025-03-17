package net.scit.backend.config;

import lombok.RequiredArgsConstructor;
import net.scit.backend.channel.handler.StompHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompHandler stompHandler; // STOMP 메시지 인증을 위한 핸들러

    /**
     * 메시지 브로커 설정
     *
     * @param registry MessageBrokerRegistry 객체
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 구독할 수 있는 메시지 브로커 경로 설정
        registry.enableSimpleBroker("/exchange/chat-exchange", "/exchange/dm-exchange");
        // 클라이언트가 메시지를 보낼 때 사용할 prefix 설정
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * STOMP 엔드포인트 등록
     *
     * @param registry StompEndpointRegistry 객체
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*") // 모든 Origin 허용
                .withSockJS(); // SockJS를 통한 Fallback 지원
    }

    /**
     * 클라이언트 인바운드 채널에 인터셉터 등록 (인증 처리 등)
     *
     * @param registration ChannelRegistration 객체
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(stompHandler); // STOMP 핸들러를 인터셉터로 등록
    }
}
