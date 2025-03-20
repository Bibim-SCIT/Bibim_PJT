package net.scit.backend.notification.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.jwt.JwtTokenProvider;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;


    @GetMapping("/subscribe")
    public SseEmitter subscribe(@RequestParam("token") String token, HttpServletResponse response) {
        log.info("📡 SSE 구독 요청 시작: token={}", token);

        if (!jwtTokenProvider.validateToken(token)) {
            log.error("❌ SSE 구독 실패: Invalid token");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        if (email == null) {
            log.error("❌ SSE 구독 실패: Unauthorized user");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized user");
        }

        // 🔹 CORS 헤더 추가 (SSE 응답에 포함)
        response.setHeader("Access-Control-Allow-Origin", "https://dev.bibim.shop"); // 로컬에서는 http://localhost:3000
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

        // 🔹 SSE 관련 헤더 추가
        response.setHeader("X-Accel-Buffering", "no");  // Nginx에서 SSE 지원을 위한 설정
        response.setHeader("Cache-Control", "no-cache"); // 캐싱 방지

        // SSEEmitter 생성 및 등록
        SseEmitter emitter = notificationService.subscribe(email);

        // 기존 안 읽은 알림을 초기 데이터로 전송
        List<NotificationEntity> unreadNotifications = notificationService.getUnreadNotifications(email);
        try {
            if (unreadNotifications != null && !unreadNotifications.isEmpty()) {
                if (notificationService.hasEmitter(email)) { // ✅ 변경된 메서드 호출
                    emitter.send(SseEmitter.event().name("HISTORY").data(unreadNotifications));
                    log.info("✅ 초기 알림 데이터 전송 완료 ({}개)", unreadNotifications.size());
                } else {
                    log.warn("⚠️ Emitter가 이미 닫힘: 알림 데이터 전송 안 함 - {}", email);
                }
            }
        } catch (IOException e) {
            log.error("❌ SSE 데이터 전송 오류: {}", e.getMessage());
            emitter.completeWithError(e);
        }



        return emitter;
    }


    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        notificationService.unsubscribe(email);
        return ResponseEntity.ok("로그아웃 성공");
    }


    @GetMapping("/unread")
    public ResponseEntity<List<NotificationEntity>> getUnreadNotifications(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        List<NotificationEntity> unreadNotifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(unreadNotifications);
    }


    @GetMapping("/read")
    public ResponseEntity<List<NotificationEntity>> getReadNotifications(
            @RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        List<NotificationEntity> readNotifications = notificationService.getReadNotifications(email);
        return ResponseEntity.ok(readNotifications);
    }


    @PostMapping("/read-single")
    public ResponseEntity<String> markAsRead(@RequestHeader("Authorization") String token,
                                             @RequestParam Long notificationNumber) {
        boolean result = notificationService.markAsRead(notificationNumber);
        return result ? ResponseEntity.ok("해당 알림을 읽는 데 성공하였습니다") : ResponseEntity.badRequest().body("해당 알림을 읽는 데 실패하였습니다");
    }


    @PostMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        boolean result = notificationService.markAllAsRead(email);
        return result ? ResponseEntity.ok("모든 알림을 읽음 처리하는 데에 성공하였습니다.") : ResponseEntity.ok("읽지 않은 알림이 없습니다.");
    }


    @DeleteMapping
    public ResponseEntity<String> deleteNotification(@RequestHeader("Authorization") String token,
                                                     @RequestParam Long notificationNumber) {
        try {
            // 토큰 접두사 제거
            if(token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String email = jwtTokenProvider.getEmailFromToken(token);
            boolean result = notificationService.deleteNotification(notificationNumber);
            return result ? ResponseEntity.ok("알림 삭제 완료") : ResponseEntity.badRequest().body("알림 삭제 실패");
        } catch (Exception e) {
            log.error("알림 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("알림 삭제 중 오류 발생: " + e.getMessage());
        }
    }


    @DeleteMapping("/delete-read")
    public ResponseEntity<String> deleteAllReadNotifications(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        boolean result = notificationService.deleteAllRead(email);
        return result ? ResponseEntity.ok("읽은 알림 전체 삭제 완료")
                : ResponseEntity.badRequest().body("삭제할 읽은 알림이 없습니다.");
    }

    @DeleteMapping("/delete-unread")
    public ResponseEntity<String> deleteAllUnreadNotifications(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        boolean result = notificationService.deleteAllUnread(email);
        return result ? ResponseEntity.ok("안 읽은 알림 전체 삭제 완료")
                : ResponseEntity.badRequest().body("삭제할 안 읽은 알림이 없습니다.");
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<Void> redirectToNotificationUrl(@PathVariable Long notificationId) {
        String url = notificationService.getNotificationUrl(notificationId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", url);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }


}
