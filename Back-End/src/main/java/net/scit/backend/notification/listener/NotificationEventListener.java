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

        // 변경: saveAll 후 flush 추가하여 즉시 DB에 반영해 ID가 생성되도록 함
        notificationRepository.saveAll(notifications);
        notificationRepository.flush(); // 변경

        // 저장 후 각각 알림 발송 (발송 로직은 sendNotification 내부에서 처리)
        notifications.forEach(notificationService::sendNotification);

        eventBuffer.clear();
        log.info("버퍼 초기화 완료.");
    }
}
