package net.scit.backend.schedule.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.dto.NotificationResponseDTO;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.schedule.event.ScheduleEvent;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduleEventListener {

    private final NotificationService notificationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @EventListener
    public void handleScheduleEvent(ScheduleEvent event) {
        String notificationMessage = event.getNotificationContent();
        Long workspaceId = event.getSchedule().getWorkspace().getWsId();
        Long scheduleId = event.getSchedule().getScheduleNumber();

        log.info("📢 Schedule 이벤트 감지: {} | 워크스페이스 ID: {} | 메시지: {}",
                event.getEventType(), workspaceId, notificationMessage);

        // 모든 경우에 동일한 URL 설정
        final String baseUrl = "https://dev.bibim.shop/schedule";

        // 특정 워크스페이스의 모든 멤버 조회
        List<WorkspaceMemberEntity> workspaceMembers =
                workspaceMemberRepository.findMembersByWorkspaceIdNative(workspaceId);

        // 각 워크스페이스 멤버에게 알림 전송
        workspaceMembers.forEach(member -> {
            NotificationEntity notification = buildNotificationEntity(event, member, workspaceId, notificationMessage, baseUrl);
            NotificationResponseDTO response = notificationService.createAndSendNotification(notification);
            log.info("📢 알림 전송 및 저장 완료 - NotificationNumber: {}", response.getNotificationNumber());
        });
    }

    /**
     * 개별 NotificationEntity 객체를 생성하는 메서드 (중복 코드 제거)
     */
    private NotificationEntity buildNotificationEntity(ScheduleEvent event, WorkspaceMemberEntity member,
                                                       Long workspaceId, String notificationMessage, String notificationUrl) {
        NotificationEntity notification = new NotificationEntity();
        notification.setWsId(workspaceId);
        notification.setSenderEmail(event.getSenderEmail());
        notification.setSenderNickname(event.getSenderNickname());
        notification.setReceiverEmail(member.getMember().getEmail());
        notification.setReceiverNickname(member.getNickname());
        notification.setNotificationName(event.getNotificationName());
        notification.setNotificationType(event.getNotificationType());
        notification.setNotificationContent(notificationMessage);
        notification.setNotificationStatus(false);
        notification.setNotificationDate(LocalDateTime.now());
        notification.setNotificationUrl(notificationUrl);
        return notification;
    }
}
