package net.scit.backend.workspace.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.workspace.event.WorkspaceEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkspaceEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleWorkspaceEvent(WorkspaceEvent event) {
        String notificationMessage = generateNotificationMessage(event);

        // 로그 기록 (디버깅 용도)
        log.info("📢 이벤트 감지: {} | 대상자: {} | 내용: {}",
                event.getEventType(), event.getReceiverEmail(), notificationMessage);

        // URL 생성
        final String baseUrl = "http://localhost:8080/workspace";
        String notificationUrl;
        // 예시로 create, update, grant, invite, join, member_update, role_update, withdraw 등의 이벤트에 대해 URL 설정
        // 상황에 따라 상세 페이지 또는 목록 페이지로 이동할 수 있도록 분기합니다.
        switch (event.getEventType()) {
            case "create":
            case "update":
            case "grant":
            case "invite":
            case "join":
            case "member_update":
            case "role_update":
                // 상세 페이지 URL: 워크스페이스 상세 페이지 (예: /workspace/{wsId})
                notificationUrl = String.format("%s/%d", baseUrl, event.getWorkspace().getWsId());
                break;
            case "withdraw":
            case "delete":
                // 삭제나 탈퇴의 경우, 목록 페이지로 이동하도록 처리
                notificationUrl = baseUrl;
                break;
            default:
                notificationUrl = baseUrl;
        }

        // 알림 엔티티 생성
        NotificationEntity notification = new NotificationEntity();
        notification.setWsId(event.getWorkspace().getWsId());
        notification.setSenderEmail(event.getSenderEmail());
        notification.setSenderNickname(event.getSenderNickname());
        notification.setReceiverEmail(event.getReceiverEmail());
        notification.setReceiverNickname(event.getReceiverNickname());
        notification.setNotificationName(event.getNotificationName());
        notification.setNotificationType(event.getNotificationType());
        notification.setNotificationContent(notificationMessage);
        notification.setNotificationStatus(false);
        notification.setNotificationDate(LocalDateTime.now());
        notification.setNotificationUrl(notificationUrl); // URL 설정 추가

        notificationService.sendNotification(notification);
    }

    // 이벤트 유형에 따라 알림 메시지 생성 (기존 코드 유지)
    private String generateNotificationMessage(WorkspaceEvent event) {
        String workspaceName = event.getWorkspace().getWsName();
        switch (event.getEventType()) {
            case "create":
                return String.format("%s님이 %s을(를) 생성하였습니다", event.getSenderNickname(), workspaceName);
            case "delete":
                return String.format("%s님이 %s을(를) 삭제하였습니다", event.getSenderNickname(), workspaceName);
            case "update":
                return String.format("%s님이 %s의 정보를 수정하였습니다", event.getSenderNickname(), workspaceName);
            case "grant":
                return String.format("%s님이 %s님에게 %s의 권한을 부여하였습니다",
                        event.getSenderNickname(), event.getReceiverNickname(), workspaceName);
            case "invite":
                return String.format("%s님이 %s님을 %s에 초대하였습니다",
                        event.getSenderNickname(), event.getReceiverNickname(), workspaceName);
            case "join":
                return String.format("%s님이 %s에 가입하였습니다",
                        event.getSenderNickname(), workspaceName);
            case "member_update":
                return String.format("%s님의 %s 회원 정보가 수정되었습니다",
                        event.getSenderNickname(), workspaceName);
            case "role_update":
                return String.format("%s님이 %s님의 %s의 워크스페이스 역할을 변경하였습니다",
                        event.getSenderNickname(), event.getReceiverNickname(), workspaceName);
            case "withdraw":
                return String.format("%s님이 %s을(를) 탈퇴하였습니다",
                        event.getReceiverNickname(), workspaceName);
            default:
                return "워크스페이스 이벤트 발생";
        }
    }
}
