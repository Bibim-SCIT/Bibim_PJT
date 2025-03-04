package net.scit.backend.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.notification.dto.NotificationRequestDTO;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
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

    // ✅ 특정 사용자의 읽지 않은 알림 조회 (JWT 기반)
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationEntity>> getUnreadNotifications(@RequestHeader("Authorization") String token) {
        String email = AuthUtil.getLoginUserId();
        List<NotificationEntity> unreadNotifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(unreadNotifications);
    }

    // ✅ 알림 읽음 처리 (JWT 기반)
    @PostMapping("/mark-read")
    public ResponseEntity<String> markAsRead(@RequestHeader("Authorization") String token, @RequestParam Long notificationNumber) {
        boolean result = notificationService.markAsRead(notificationNumber);
        return result
                ? ResponseEntity.ok("해당 알림을 읽는 데 성공하였습니다")
                : ResponseEntity.badRequest().body("해당 알림을 읽는 데 실패하였습니다");
    }

    // ✅ 알림 삭제 (JWT 기반 + 워크스페이스 검증 추가)
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

    // ✅ 새로운 알림을 수동으로 생성 (JWT 기반 + 워크스페이스 검증 추가)
    @PostMapping("/create")
    public ResponseEntity<String> createNotification(
            @RequestHeader("Authorization") String token,
            @RequestBody NotificationRequestDTO request) {
        try {
            String email = AuthUtil.getLoginUserId();

            // 워크스페이스 검증 (workspaceId가 존재하는 경우에만 체크)
            if (request.getWorkspaceId() != null) {
                Optional<WorkspaceMemberEntity> optionalWsMember = workspaceMemberRepository
                        .findByWorkspace_wsIdAndMember_Email(request.getWorkspaceId(), email);
                if (optionalWsMember.isEmpty()) {
                    return ResponseEntity.badRequest().body("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.");
                }
            }

            // 알림 생성
            notificationService.createNotification(email,
                    request.getWorkspaceId(),
                    request.getScheduleNumber(),
                    request.getRecordNumber(),
                    request.getWorkdataNumber(),
                    request.getNotificationName(),
                    request.getNotificationType(),
                    request.getNotificationContent());

            // ✅ 응답 메시지에 알림 정보 추가
            String responseMessage = String.format(
                    "알림 생성에 성공하였습니다. [알림 제목: %s, 유형: %s]",
                    request.getNotificationName(),
                    request.getNotificationType()
            );

            return ResponseEntity.ok(responseMessage);
        } catch (Exception e) {
            log.error("알림 생성 중 오류 발생", e);
            return ResponseEntity.status(500).body("알림 생성 중 오류 발생: " + e.getMessage());
        }
    }


}
