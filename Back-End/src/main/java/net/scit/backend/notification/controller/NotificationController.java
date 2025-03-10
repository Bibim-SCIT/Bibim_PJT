package net.scit.backend.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.notification.dto.NotificationRequestDTO;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/notification") // 기본 URL 유지
@RequiredArgsConstructor // Lombok을 이용한 생성자 자동 생성
@Slf4j // 로깅 추가
public class NotificationController {

    private final NotificationService notificationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    // ✅ SSE 구독 엔드포인트 (JWT 기반)
    @GetMapping("/subscribe")
    public SseEmitter subscribe(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        return notificationService.subscribe(email);
    }

    /**
     * ✅ 특정 사용자의 읽지 않은 알림 조회 (JWT 기반)
     * 
     * @param token
     * @return
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationEntity>> getUnreadNotifications(
            @RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        List<NotificationEntity> unreadNotifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(unreadNotifications);
    }

    /**
     * / ✅ 알림 개별 읽음 처리 (JWT 기반)
     * 
     * @param token
     * @param notificationNumber
     * @return
     */
    @PostMapping("/read-single")
    public ResponseEntity<String> markAsRead(@RequestHeader("Authorization") String token,
            @RequestParam Long notificationNumber) {
        boolean result = notificationService.markAsRead(notificationNumber);
        return result
                ? ResponseEntity.ok("해당 알림을 읽는 데 성공하였습니다")
                : ResponseEntity.badRequest().body("해당 알림을 읽는 데 실패하였습니다");
    }

    /**
     * ✅ 알림 모두 읽음 처리 (JWT 기반)
     * 
     * @param token
     * @return
     */
    @PostMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        boolean result = notificationService.markAllAsRead(email);

        return result
                ? ResponseEntity.ok("모든 알림을 읽음 처리하는 데에 성공하였습니다.")
                : ResponseEntity.ok("읽지 않은 알림이 없습니다.");
    }

    /**
     * ✅ 알림 삭제 (JWT 기반 + 워크스페이스 검증 추가)
     * 
     * @param token
     * @param notificationNumber
     * @param workspaceId
     * @return
     */
    @DeleteMapping
    public ResponseEntity<String> deleteNotification(@RequestHeader("Authorization") String token,
            @RequestParam Long notificationNumber,
            @RequestParam Long workspaceId) {
        try {
            String email = AuthUtil.getLoginUserId();

            // 워크스페이스 및 사용자 검증
            Optional<WorkspaceMemberEntity> optionalWsMember = workspaceMemberRepository
                    .findByWorkspace_wsIdAndMember_Email(workspaceId, email);

            if (optionalWsMember.isEmpty()) {
                return ResponseEntity.badRequest().body("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.");
            }

            boolean result = notificationService.deleteNotification(notificationNumber);
            return result
                    ? ResponseEntity.ok("알림 삭제 완료")
                    : ResponseEntity.badRequest().body("알림 삭제 실패");
        } catch (Exception e) {
            log.error("알림 삭제 중 오류 발생", e);
            return ResponseEntity.status(500).body("알림 삭제 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 알림 클릭 시 해당 알림의 URL로 리다이렉트
     * @param notificationId
     * @return
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<Void> redirectToNotificationUrl(@PathVariable Long notificationId) {
        String url = notificationService.getNotificationUrl(notificationId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", url);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

}
