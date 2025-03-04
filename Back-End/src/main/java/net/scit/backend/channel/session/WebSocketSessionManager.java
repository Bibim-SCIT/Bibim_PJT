package net.scit.backend.channel.session;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component
public class WebSocketSessionManager {
    private final Map<String, String> sessionChannelMap = new ConcurrentHashMap<>();

    public void addSession(WebSocketSession session, String channelId) {
        sessionChannelMap.put(session.getId(), channelId);
    }

    public String getChannelId(WebSocketSession session) {
        return sessionChannelMap.get(session.getId());
    }

    public void removeSession(WebSocketSession session) {
        sessionChannelMap.remove(session.getId());
    }
}
