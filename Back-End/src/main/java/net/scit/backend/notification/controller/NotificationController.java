package net.scit.backend.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.jwt.JwtTokenProvider;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * SSE 구독 처리 메서드
     */
    @GetMapping("/subscribe")
    public SseEmitter subscribe(@RequestParam("token") String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized user");
        }

        SseEmitter emitter = notificationService.subscribe(email);
        List<NotificationEntity> unreadNotifications = notificationService.getUnreadNotifications(email);
        try {
            emitter.send(SseEmitter.event().name("HISTORY").data(unreadNotifications));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }

    /**
     * 로그아웃 처리 및 SSE 구독 해제
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        notificationService.unsubscribe(email);
        return ResponseEntity.ok("로그아웃 성공");
    }

    /**
     * 읽지 않은 알림 조회
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationEntity>> getUnreadNotifications(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        List<NotificationEntity> unreadNotifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(unreadNotifications);
    }

    /**
     * 읽은 알림 조회
     */
    @GetMapping("/read")
    public ResponseEntity<List<NotificationEntity>> getReadNotifications(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        List<NotificationEntity> readNotifications = notificationService.getReadNotifications(email);
        return ResponseEntity.ok(readNotifications);
    }

    /**
     * 단일 알림 읽음 처리
     */
    @PostMapping("/read-single")
    public ResponseEntity<String> markAsRead(@RequestHeader("Authorization") String token, @RequestParam Long notificationNumber) {
        boolean result = notificationService.markAsRead(notificationNumber);
        return result ? ResponseEntity.ok("해당 알림을 읽는 데 성공하였습니다") : ResponseEntity.badRequest().body("해당 알림을 읽는 데 실패하였습니다");
    }

    /**
     * 모든 알림 읽음 처리
     */
    @PostMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        boolean result = notificationService.markAllAsRead(email);
        return result ? ResponseEntity.ok("모든 알림을 읽음 처리하는 데에 성공하였습니다.") : ResponseEntity.ok("읽지 않은 알림이 없습니다.");
    }

    /**
     * 단일 알림 삭제 처리
     */
    @DeleteMapping
    public ResponseEntity<String> deleteNotification(@RequestHeader("Authorization") String token, @RequestParam Long notificationNumber) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String email = jwtTokenProvider.getEmailFromToken(token);
            boolean result = notificationService.deleteNotification(notificationNumber);
            return result ? ResponseEntity.ok("알림 삭제 완료") : ResponseEntity.badRequest().body("알림 삭제 실패");
        } catch (Exception e) {
            log.error("알림 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("알림 삭제 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 알림 URL로 리다이렉트
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<Void> redirectToNotificationUrl(@PathVariable Long notificationId) {
        String url = notificationService.getNotificationUrl(notificationId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", url);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
