package net.scit.backend.workspace.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.dto.NotificationResponseDTO;
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
        String notificationName = event.getNotificationName();
        String notificationContent = event.getNotificationContent();

        // 이벤트 유형에 따라 URL 결정
        String notificationUrl;
        if ("delete".equals(event.getEventType()) || "withdraw".equals(event.getEventType())) {
            notificationUrl = "http://localhost:8080/workspace";
        } else {
            notificationUrl = String.format("http://localhost:8080/workspace/%d", event.getWsId());
        }

        log.info("📢 이벤트 감지: {} | 대상자: {} | 내용: {} | URL: {}",
                event.getEventType(), event.getReceiverEmail(), notificationContent, notificationUrl);

        NotificationEntity notification = new NotificationEntity();

        // ✅ wsName 필드가 없으므로 직접 notificationName, notificationContent에서 활용
        notification.setWsId(event.getWsId());

        notification.setSenderEmail(event.getSenderEmail());
        notification.setSenderNickname(event.getSenderNickname());
        notification.setReceiverEmail(event.getReceiverEmail());
        notification.setReceiverNickname(event.getReceiverNickname());
        notification.setNotificationName(notificationName);
        notification.setNotificationType(event.getNotificationType());
        notification.setNotificationContent(notificationContent);
        notification.setNotificationStatus(false);
        notification.setNotificationDate(LocalDateTime.now());
        notification.setNotificationUrl(notificationUrl);

        NotificationResponseDTO response = notificationService.createAndSendNotification(notification);
        log.info("📢 알림 전송 및 저장 완료 - NotificationNumber: {}", response.getNotificationNumber());
    }

}
