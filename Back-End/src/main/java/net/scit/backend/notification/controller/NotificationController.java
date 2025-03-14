package net.scit.backend.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    private final WorkspaceMemberRepository workspaceMemberRepository;


    @GetMapping("/subscribe")
    public SseEmitter subscribe(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        SseEmitter emitter = notificationService.subscribe(email);  // ✅ 이제 정상적으로 호출 가능!

        // 기존 읽지 않은 알림 전송
        List<NotificationEntity> unreadNotifications = notificationService.getUnreadNotifications(email);
        try {
            emitter.send(SseEmitter.event().name("HISTORY").data(unreadNotifications));
        } catch (IOException e) {
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
                                                     @RequestParam Long notificationNumber,
                                                     @RequestParam Long workspaceId) {
        try {
            String email = AuthUtil.getLoginUserId();
            Optional<WorkspaceMemberEntity> optionalWsMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(workspaceId, email);
            if (optionalWsMember.isEmpty()) {
                return ResponseEntity.badRequest().body("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.");
            }
            boolean result = notificationService.deleteNotification(notificationNumber);
            return result ? ResponseEntity.ok("알림 삭제 완료") : ResponseEntity.badRequest().body("알림 삭제 실패");
        } catch (Exception e) {
            log.error("알림 삭제 중 오류 발생", e);
            return ResponseEntity.status(500).body("알림 삭제 중 오류 발생: " + e.getMessage());
        }
    }


    @GetMapping("/{notificationId}")
    public ResponseEntity<Void> redirectToNotificationUrl(@PathVariable Long notificationId) {
        String url = notificationService.getNotificationUrl(notificationId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", url);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
