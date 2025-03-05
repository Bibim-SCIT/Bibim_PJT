package net.scit.backend.notification.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.repository.NotificationRepository;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    // 1) ConcurrentHashMap 대신 List를 사용
    private final List<BasedUpdatedEvent> eventBuffer = new CopyOnWriteArrayList<>();

    @EventListener
    public void handleEntityUpdate(BasedUpdatedEvent event) {
        eventBuffer.add(event);
        log.info("이벤트 감지 (버퍼 저장): {} - {}", event.getNotificationType(), event.getEntityId());
    }

    // SSE 가동 시간: 1분 * ?
    @Scheduled(fixedRate = 1000 * 30)
    public void processBufferedEvents() {
        if (eventBuffer.isEmpty()) return;

        log.info("버퍼에 저장된 이벤트 처리 시작...");
        List<NotificationEntity> notifications = new ArrayList<>();

        // 2) 버퍼에 들어있는 모든 이벤트를 순회하며 알림 생성
        for (BasedUpdatedEvent event : eventBuffer) {
            NotificationEntity notification = new NotificationEntity();
            notification.setMemberEmail(event.getUpdatedBy());
            notification.setNotificationName(event.getNotificationName());
            notification.setNotificationType(event.getNotificationType());
            notification.setNotificationContent(event.getNotificationContent());
            notification.setNotificationStatus(false);
            notification.setNotificationDate(LocalDateTime.now());

            notifications.add(notification);
        }

        // 3) 알림을 DB에 저장 및 SSE 실시간 전송
        notificationRepository.saveAll(notifications);
        notifications.forEach(notificationService::sendNotification);

        // 4) 버퍼 초기화
        eventBuffer.clear();
        log.info("버퍼 초기화 완료.");
    }

}
