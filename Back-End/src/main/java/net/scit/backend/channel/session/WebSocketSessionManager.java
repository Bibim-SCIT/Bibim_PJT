package net.scit.backend.channel.session;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class WebSocketSessionManager {
    // ✅ 채널별 세션을 관리하는 구조
    private final ConcurrentHashMap<String, Set<WebSocketSession>> channelSessions = new ConcurrentHashMap<>();

    // ✅ 세션 추가 (채널에 사용자 추가)
    public void addSession(WebSocketSession session, String channelId) {
        channelSessions.computeIfAbsent(channelId, k -> new CopyOnWriteArraySet<>()).add(session);
    }

    // ✅ 채널의 모든 세션 가져오기
    public Set<WebSocketSession> getSessionsByChannel(String channelId) {
        return channelSessions.getOrDefault(channelId, new CopyOnWriteArraySet<>());
    }

    // ✅ 세션 제거 (사용자가 나가면 제거)
    public void removeSession(WebSocketSession session, String channelId) {
        Set<WebSocketSession> sessions = channelSessions.get(channelId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                channelSessions.remove(channelId);
            }
        }
    }
}
