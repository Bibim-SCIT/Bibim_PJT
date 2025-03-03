package net.scit.backend.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.JwtTokenProvider;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Component
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest) {
            HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();

            String token = jwtTokenProvider.getJwtFromRequest(servletRequest);

            if (token == null) {
                String query = servletRequest.getQueryString();
                if (query != null && query.contains("token=")) {
                    token = query.split("token=")[1].split("&")[0];
                }
            }

            if (token != null && jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);

                attributes.put("username", username); // ✅ STOMP 세션 저장
                log.info("✅ WebSocket 인증 성공 및 속성 저장: {}", username);
                return true;
            } else {
                log.warn("❌ WebSocket 인증 실패: 토큰 없음 또는 유효하지 않음");
                return false;
            }
        }
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}
