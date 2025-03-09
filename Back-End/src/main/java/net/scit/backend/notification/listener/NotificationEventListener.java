package net.scit.backend.notification.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.repository.NotificationRepository;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workspace.event.WorkspaceEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    // 이벤트 버퍼 (동시성 고려)
    private final List<BasedUpdatedEvent> eventBuffer = new CopyOnWriteArrayList<>();

    @EventListener
    public void handleEntityUpdate(BasedUpdatedEvent event) {
        eventBuffer.add(event);
        log.info("이벤트 감지 (버퍼 저장): {} - {}", event.getNotificationType(), event.getEntityId());
    }

    // 30초마다 버퍼 처리 (예시)
    @Scheduled(fixedRate = 1000 * 30)
    public void processBufferedEvents() {
        if (eventBuffer.isEmpty()) return;

        log.info("버퍼에 저장된 이벤트 처리 시작...");
        List<NotificationEntity> notifications = new ArrayList<>();

        // 이벤트 버퍼의 모든 이벤트에 대해 개별 알림 생성 (WorkspaceEvent 기준)
        for (BasedUpdatedEvent event : eventBuffer) {
            if (!(event instanceof WorkspaceEvent)) continue; // WorkspaceEvent가 아닌 경우 스킵
            WorkspaceEvent we = (WorkspaceEvent) event;
            NotificationEntity notification = new NotificationEntity();

            // ✅ 수정됨: WorkspaceEvent에서 워크스페이스 ID, sender/receiver 이메일, 닉네임 등을 추출하여 저장
            notification.setWsId(we.getWorkspace().getWsId());
            notification.setSenderEmail(we.getSenderEmail());           // sender 이메일
            notification.setSenderNickname(we.getSenderNickname());       // sender 닉네임
            notification.setReceiverEmail(we.getReceiverEmail());         // receiver 이메일
            notification.setReceiverNickname(we.getReceiverNickname());   // receiver 닉네임

            notification.setNotificationName(we.getNotificationName());
            notification.setNotificationType(we.getNotificationType());
            notification.setNotificationContent(we.getNotificationContent());
            notification.setNotificationStatus(false);
            notification.setNotificationDate(LocalDateTime.now());

            notifications.add(notification);
        }

        notificationRepository.saveAll(notifications);
        notifications.forEach(notificationService::sendNotification);

        eventBuffer.clear();
        log.info("버퍼 초기화 완료.");
    }
}
