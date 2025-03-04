package net.scit.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.JwtTokenProvider;
import net.scit.backend.channel.session.WebSocketSessionManager;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@RequiredArgsConstructor
public class CustomWebSocketHandler extends TextWebSocketHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final WebSocketSessionManager sessionManager;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String token = extractToken(session);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            log.error("❌ WebSocket 인증 실패 - JWT 없음 또는 유효하지 않음");
            session.close();
            return;
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        String channelId = extractChannelId(session);
        if (channelId == null) {
            log.error("❌ 채널 ID 없음");
            session.close();
            return;
        }

        session.getAttributes().put("username", username); // ✅ 사용자 정보 저장
        sessionManager.addSession(session, channelId);

        log.info("✅ WebSocket 연결 성공: {} (채널 ID: {})", username, channelId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String username = (String) session.getAttributes().get("username");
        if (username == null) {
            log.error("❌ WebSocket 메시지 처리 실패 - 사용자 정보 없음");
            return;
        }

        log.info("📩 메시지 받음 ({}): {}", username, message.getPayload());
        session.sendMessage(new TextMessage("메시지 확인됨: " + message.getPayload()));
    }

    private String extractToken(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                if (param.startsWith("token=")) {
                    return param.substring(6); // "token=" 이후 값 반환
                }
            }
        }
        return null;
    }

    private String extractChannelId(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                if (param.startsWith("channelId=")) {
                    return param.substring(10); // "channelId=" 이후 값 반환
                }
            }
        }
        return null;
    }
}
