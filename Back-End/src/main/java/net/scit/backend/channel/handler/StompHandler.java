package net.scit.backend.channel.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.JwtTokenProvider;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // STOMP 연결 요청이면 JWT 검증 후 세션 저장
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            log.info("📌 STOMP Authorization 헤더: {}", token);

            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7); // "Bearer " 제거
            }

            if (token == null || !jwtTokenProvider.validateToken(token)) {
                log.error("❌ STOMP 인증 실패: JWT가 없거나 유효하지 않음");
                throw new IllegalArgumentException("JWT 인증 실패");
            }

            String username = jwtTokenProvider.getUsernameFromToken(token);
            accessor.getSessionAttributes().put("username", username); // 사용자 정보 저장
            log.info("✅ STOMP 인증 성공 - 사용자: {}", username);
        }

        // 메시지 전송 요청(SEND)에서도 세션에서 사용자 정보를 가져옴
        if (StompCommand.SEND.equals(accessor.getCommand())) {
            String username = (String) accessor.getSessionAttributes().get("username");
            if (username == null) {
                log.error("❌ STOMP 메시지 전송 실패 - 사용자 정보 없음");
                throw new IllegalArgumentException("STOMP 메시지 전송 실패: 사용자 정보 없음");
            }
            log.info("📩 STOMP 메시지 보냄 - 사용자: {}", username);
        }

        return message;
    }
}