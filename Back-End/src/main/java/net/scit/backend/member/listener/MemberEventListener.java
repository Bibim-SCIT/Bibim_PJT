package net.scit.backend.member.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.member.event.MemberEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class MemberEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleMemberEvent(MemberEvent event) {
        // 로그인 이벤트 제외
        if ("login".equals(event.getEventType())) {
            return;
        }

        // 로그 기록 (디버깅 용도)
        log.info("📢 Member 이벤트 감지: {} | 대상 회원: {}", event.getNotificationType(), event.getMember().getEmail());

        // NotificationEntity 생성 및 알림 전송
        NotificationEntity notification = new NotificationEntity();
        notification.setSenderEmail(event.getSenderEmail());
        notification.setSenderNickname(event.getSenderName());  // 닉네임 대신 이름 사용
        notification.setReceiverEmail(event.getMember().getEmail());
        notification.setReceiverNickname(event.getMember().getName());  // 수신자 이름 사용
        notification.setNotificationName(event.getNotificationName());
        notification.setNotificationType(event.getNotificationType());
        notification.setNotificationContent(event.getNotificationContent());
        notification.setNotificationStatus(false);
        notification.setNotificationDate(LocalDateTime.now());

        notificationService.sendNotification(notification);
    }
}
