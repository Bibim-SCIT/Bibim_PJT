package net.scit.backend.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class WebSocketConfig {
    /**
     * 메시지 브로커를 설정하는 메서드
     * - 메시지를 전송하고 받을 경로를 설정함
     *
     * @param config 메시지 브로커 설정 객체
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        /**
         * 1️⃣ 간단한 메시지 브로커 활성화 (클라이언트가 메시지를 받을 경로 설정)
         * - "/topic" 경로를 구독하면 해당 경로로 전송되는 메시지를 받을 수 있음.
         * - 예를 들어, 클라이언트가 "/topic/public"을 구독하면, 해당 경로로 오는 모든 메시지를 수신함.
         */
        config.enableSimpleBroker("/topic");

        /**
         * 2️⃣ 클라이언트에서 보낼 메시지의 prefix 설정
         * - "/app"으로 시작하는 메시지는 @MessageMapping을 통해 처리됨.
         * - 예를 들어, 클라이언트가 "/app/chat.sendMessage"로 메시지를 보내면, 컨트롤러에서 처리됨.
         */
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * WebSocket 엔드포인트를 설정하는 메서드
     * - 클라이언트가 WebSocket에 연결할 수 있는 주소를 정의함
     *
     * @param registry STOMP 엔드포인트 등록 객체
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        /**
         * 1️⃣ WebSocket 엔드포인트 등록
         * - "/ws" 엔드포인트를 통해 WebSocket 연결을 생성할 수 있음.
         * - 클라이언트는 "ws://localhost:8080/ws"로 연결 요청을 보낼 수 있음.
         */
        registry.addEndpoint("/ws")

                /**
                 * 2️⃣ CORS(Cross-Origin Resource Sharing) 허용
                 * - React 클라이언트(`http://localhost:3000`)에서 WebSocket 요청을 보낼 수 있도록 허용함.
                 */
                .setAllowedOrigins("http://localhost:3000")

                /**
                 * 3️⃣ SockJS 지원
                 * - WebSocket을 지원하지 않는 브라우저에서도 정상적으로 작동하도록 함.
                 * - 클라이언트는 자동으로 WebSocket을 사용할 수 없는 경우 SockJS로 대체함.
                 */
                .withSockJS();
    }
}
