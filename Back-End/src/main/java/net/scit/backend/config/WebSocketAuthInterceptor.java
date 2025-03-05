package net.scit.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.JwtTokenProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {

        HttpHeaders headers = ((org.springframework.http.server.ServletServerHttpRequest) request).getHeaders();
        List<String> authorizationHeaders = headers.get("Authorization");

        if (authorizationHeaders == null || authorizationHeaders.isEmpty()) {
            log.error("❌ WebSocket 인증 실패: Authorization 헤더 없음");
            return false;
        }

        String token = authorizationHeaders.get(0);
        if (token.startsWith("Bearer ")) {
            token = token.substring(7); // "Bearer " 제거
        }

        if (!jwtTokenProvider.validateToken(token)) {
            log.error("❌ WebSocket 인증 실패: JWT가 유효하지 않음");
            return false; // 인증 실패 시 WebSocket 연결 차단
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        attributes.put("username", username);
        log.info("✅ WebSocket 인증 성공 - 사용자: {}", username);
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("❌ WebSocket 핸드셰이크 실패: {}", exception.getMessage());
        } else {
            log.info("✅ WebSocket 핸드셰이크 완료");
        }
    }
}
