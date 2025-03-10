package net.scit.backend.member.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.dto.NotificationResponseDTO;
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
        // 로그인 이벤트는 처리하지 않음
        if ("login".equals(event.getEventType())) {
            return;
        }

        log.info("📢 Member 이벤트 감지: {} | 대상 회원: {}", event.getNotificationType(), event.getMember().getEmail());

        // NotificationEntity 생성
        NotificationEntity notification = new NotificationEntity();
        notification.setSenderEmail(event.getSenderEmail());
        notification.setSenderNickname(event.getSenderName()); // 이름 사용
        notification.setReceiverEmail(event.getMember().getEmail());
        notification.setReceiverNickname(event.getMember().getName()); // 수신자 이름 사용
        notification.setNotificationName(event.getNotificationName());
        notification.setNotificationType(event.getNotificationType());
        notification.setNotificationContent(event.getNotificationContent());
        notification.setNotificationStatus(false);
        notification.setNotificationDate(LocalDateTime.now());
        // 모든 회원 관련 알림은 회원정보 페이지로 이동하도록 고정
        notification.setNotificationUrl("http://localhost:8080/members/myInfo");

        // ✅ 변경: createAndSendNotification()을 사용하여 ID가 즉시 반영되도록 함
        NotificationResponseDTO savedNotification = notificationService.createAndSendNotification(notification);
        log.info("✅ Member 알림 저장 완료: notificationNumber={}", savedNotification.getNotificationNumber());
    }
}
