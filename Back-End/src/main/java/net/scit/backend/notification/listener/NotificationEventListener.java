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

        // 예시: 여기서는 단일 이벤트당 단일 알림을 생성합니다.
        // 실제 구현에서는 이벤트에 따른 대상(수신자)을 모두 조회하여 알림을 생성해야 할 수 있습니다.
        for (BasedUpdatedEvent event : eventBuffer) {
            NotificationEntity notification = new NotificationEntity();

            // 아래 값들은 실제 이벤트에서 추출하거나 관련 서비스를 통해 조회해야 합니다.
            // sender 정보: 여기서는 event.getUpdatedBy()를 보낸 사람의 이메일로 가정
            notification.setSenderEmail(event.getUpdatedBy());
            notification.setSenderNickname("보낸사람닉네임"); // 예: 조회 또는 이벤트에 포함된 값

            // workspaceId: 이벤트에서 워크스페이스 정보를 제공하지 않는다면, 추가 처리가 필요합니다.
            // 예시로 1L로 설정 (실제 환경에 맞게 수정)
            notification.setWsId(1L);

            // receiver 정보: 실제 알림 대상은 워크스페이스 내 멤버 목록 등에서 가져와야 함.
            // 여기서는 예시로 단일 수신자를 설정합니다.
            notification.setReceiverEmail("receiver@example.com");
            notification.setReceiverNickname("받는사람닉네임");

            // 알림 기본 정보
            notification.setNotificationName(event.getNotificationName());
            notification.setNotificationType(event.getNotificationType());
            notification.setNotificationContent(event.getNotificationContent());
            notification.setNotificationStatus(false);
            notification.setNotificationDate(LocalDateTime.now());
            notifications.add(notification);
        }

        // DB 저장 및 SSE 전송
        notificationRepository.saveAll(notifications);
        notifications.forEach(notificationService::sendNotification);

        // 버퍼 초기화
        eventBuffer.clear();
        log.info("버퍼 초기화 완료.");
    }
}
