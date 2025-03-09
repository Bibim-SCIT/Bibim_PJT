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

        // 1️⃣ 로그 기록 (디버깅 용도)
        log.info("📢 이벤트 감지: {} | 대상자: {} | 내용: {}", event.getEventType(), event.getReceiverEmail(), notificationMessage);

        // 2️⃣ 알림 서비스 호출 (DB 저장 + SSE 전송)
// NotificationEntity 객체를 생성해서 인자로 전달합니다.
        NotificationEntity notification = new NotificationEntity();
        notification.setWsId(event.getWorkspace().getWsId());
        notification.setSenderEmail(event.getSenderEmail());             // 이벤트 발신자 이메일
        notification.setSenderNickname(event.getSenderNickname());         // 이벤트 발신자 닉네임
        notification.setReceiverEmail(event.getReceiverEmail());           // 이벤트 수신자 이메일
        notification.setReceiverNickname(event.getReceiverNickname());     // 이벤트 수신자 닉네임
        notification.setNotificationName(event.getNotificationName());
        notification.setNotificationType(event.getNotificationType());
        notification.setNotificationContent(notificationMessage);
        notification.setNotificationStatus(false);
        notification.setNotificationDate(LocalDateTime.now());

        notificationService.sendNotification(notification);

    }

    // 📌 이벤트 유형에 따라 알림 메시지 생성
    private String generateNotificationMessage(WorkspaceEvent event) {
        String workspaceName = event.getWorkspace().getWsName();
        switch (event.getEventType()) {
            case "create":
                return String.format("%s님이 %s 워크스페이스를 생성하였습니다", event.getSenderNickname(), workspaceName);
            case "delete":
                return String.format("%s님이 %s 워크스페이스를 삭제하였습니다", event.getSenderNickname(), workspaceName);
            case "update":
                return String.format("%s님이 %s 워크스페이스 정보를 수정하였습니다", event.getSenderNickname(), workspaceName);
            case "grant":
                return String.format("%s님이 %s님에게 %s 워크스페이스의 권한을 부여하였습니다",
                        event.getSenderNickname(), event.getReceiverNickname(), workspaceName);
            case "invite":
                return String.format("%s님이 %s님을 %s 워크스페이스에 초대하였습니다",
                        event.getSenderNickname(), event.getReceiverNickname(), workspaceName);
            case "join":
                return String.format("%s님이 %s 워크스페이스에 가입하였습니다",
                        event.getSenderNickname(), workspaceName);
            case "member_update":
                return String.format("%s님의 %s 워크스페이스 내 회원 정보가 수정되었습니다",
                        event.getSenderNickname(), workspaceName);
            case "role_update":
                return String.format("%s님이 %s님의 %s 워크스페이스 역할을 변경하였습니다",
                        event.getSenderNickname(), event.getReceiverNickname(), workspaceName);
            case "withdraw":
                return String.format("%s님이 %s 워크스페이스를 탈퇴하였습니다",
                        event.getReceiverNickname(), workspaceName);
            default:
                return "워크스페이스 이벤트 발생";
        }
    }
}
