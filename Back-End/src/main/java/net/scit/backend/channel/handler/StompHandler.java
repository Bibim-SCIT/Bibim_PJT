package net.scit.backend.channel.handler;

import lombok.RequiredArgsConstructor;
import net.scit.backend.jwt.JwtTokenProvider;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider; // JWT 토큰 프로바이더 주입

    /**
     * STOMP 메시지를 처리하기 전 동작하는 메서드
     *
     * @param message STOMP 메시지
     * @param channel 메시지 채널
     * @return 처리된 메시지
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        switch (accessor.getCommand()) {
            case CONNECT -> handleConnect(accessor); // CONNECT 요청 처리
            case SEND -> handleSend(accessor); // SEND 요청 처리
        }

        return message; // 처리된 메시지 반환
    }

    /**
     * STOMP CONNECT 요청 처리: JWT 인증 및 세션에 사용자 정보 저장
     *
     * @param accessor STOMP 헤더 접근 객체
     */
    private void handleConnect(StompHeaderAccessor accessor) {
        String token = extractTokenFromHeader(accessor.getFirstNativeHeader("Authorization"));

        if (token == null || !jwtTokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("STOMP CONNECT 실패: JWT가 없거나 유효하지 않음");
        }

        String username = jwtTokenProvider.getUsernameFromToken(token); // JWT에서 사용자명 추출
        accessor.getSessionAttributes().put("username", username); // 세션에 사용자명 저장
    }

    /**
     * STOMP SEND 요청 처리: 세션에 사용자 정보가 있는지 확인
     *
     * @param accessor STOMP 헤더 접근 객체
     */
    private void handleSend(StompHeaderAccessor accessor) {
        String username = (String) accessor.getSessionAttributes().get("username");

        if (username == null) {
            throw new IllegalArgumentException("STOMP 메시지 전송 실패: 세션에 사용자 정보 없음");
        }
    }

    /**
     * Authorization 헤더에서 Bearer 토큰을 추출
     *
     * @param authorizationHeader Authorization 헤더 값
     * @return Bearer 토큰 문자열, 유효하지 않으면 null
     */
    private String extractTokenFromHeader(String authorizationHeader) {
        return (authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
                ? authorizationHeader.substring(7) // "Bearer " 접두사 제거 후 토큰 반환
                : null;
    }
}
