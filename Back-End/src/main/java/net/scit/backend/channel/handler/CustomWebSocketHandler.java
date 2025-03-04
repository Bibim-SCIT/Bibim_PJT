package net.scit.backend.channel.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.JwtTokenProvider;
import net.scit.backend.channel.session.WebSocketSessionManager;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.Set;

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

        // ✅ 사용자 정보 저장
        session.getAttributes().put("username", username);
        session.getAttributes().put("channelId", channelId);
        sessionManager.addSession(session, channelId); // ✅ 채널에 사용자 추가

        log.info("✅ WebSocket 연결 성공: {} (채널 ID: {})", username, channelId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String username = (String) session.getAttributes().get("username");
        String channelId = (String) session.getAttributes().get("channelId");

        if (username == null || channelId == null) {
            log.error("❌ WebSocket 메시지 처리 실패 - 사용자 또는 채널 정보 없음");
            return;
        }

        String msgPayload = username + ": " + message.getPayload();
        log.info("📩 메시지 받음 ({}) - {}", channelId, msgPayload);

        // ✅ 같은 채널의 모든 사용자에게 메시지 전송
        Set<WebSocketSession> channelSessions = sessionManager.getSessionsByChannel(channelId);
        for (WebSocketSession s : channelSessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(msgPayload));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String channelId = (String) session.getAttributes().get("channelId");
        if (channelId != null) {
            sessionManager.removeSession(session, channelId);
            log.info("❌ 사용자 연결 종료 (채널 ID: {})", channelId);
        }
    }

    private String extractToken(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                if (param.startsWith("token=")) {
                    return param.substring(6);
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
                    return param.substring(10);
                }
            }
        }
        return null;
    }
}
