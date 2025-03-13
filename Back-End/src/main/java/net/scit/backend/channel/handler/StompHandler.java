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

    /**
     * STOMP 메시지를 처리하기 전 동작
     *
     * @param message STOMP 메시지
     * @param channel 메시지 채널
     * @return 처리된 메시지
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // STOMP 커맨드 처리
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            handleConnect(accessor); // CONNECT 요청 처리 메서드
        } else if (StompCommand.SEND.equals(accessor.getCommand())) {
            handleSend(accessor); // SEND 요청 처리 메서드
        }

        return message; // 메시지 반환
    }

    /**
     * STOMP CONNECT 처리: JWT 인증 및 사용자 정보 저장
     *
     * @param accessor STOMP 헤더 접근 객체
     */
    private void handleConnect(StompHeaderAccessor accessor) {
        String token = extractTokenFromHeader(accessor.getFirstNativeHeader("Authorization"));
        log.info("📌 STOMP 연결 요청: Authorization 헤더 [{}]", token != null ? "존재" : "없음");

        if (token == null || !jwtTokenProvider.validateToken(token)) {
            log.error("❌ STOMP CONNECT 실패: 유효하지 않은 JWT");
            throw new IllegalArgumentException("STOMP CONNECT 실패: JWT가 없거나 유효하지 않음");
        }

        String username = jwtTokenProvider.getUsernameFromToken(token); // 토큰에서 사용자 정보 추출
        accessor.getSessionAttributes().put("username", username); // 세션에 사용자 정보 저장
        log.info("✅ STOMP CONNECT 성공: 사용자 [{}]", username);
    }

    /**
     * STOMP SEND 처리: 세션에서 사용자 정보 확인
     *
     * @param accessor STOMP 헤더 접근 객체
     */
    private void handleSend(StompHeaderAccessor accessor) {
        String username = (String) accessor.getSessionAttributes().get("username"); // 세션에서 사용자 정보 가져오기

        if (username == null) {
            log.error("❌ STOMP 메시지 전송 실패: 세션에 사용자 정보 없음");
            throw new IllegalArgumentException("STOMP 메시지 전송 실패: 사용자 정보 없음");
        }

        log.info("📩 STOMP 메시지 전송 요청: 사용자 [{}]", username);
    }

    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     *
     * @param authorizationHeader Authorization 헤더 값
     * @return Bearer 토큰
     */
    private String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null; // 헤더가 없거나 형식이 잘못된 경우 null 반환
        }
        return authorizationHeader.substring(7); // "Bearer " 접두사 제거 후 토큰 반환
    }
}