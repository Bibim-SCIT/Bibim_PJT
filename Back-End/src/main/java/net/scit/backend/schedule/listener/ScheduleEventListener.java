package net.scit.backend.schedule.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

        // 기본 주소 + 컨트롤러 매핑 적용 (예: http://localhost:8080/schedule)
        final String baseUrl = "http://localhost:8080/schedule";
        String notificationUrl;
        switch (event.getEventType()) {
            case "create":
            case "assignee_update":
            case "info_update":
            case "status_update":
                notificationUrl = String.format("%s/%d", baseUrl, scheduleId);
                break;
            case "delete":
                // 삭제 시에는 목록 페이지로 이동
                notificationUrl = baseUrl;
                break;
            default:
                notificationUrl = baseUrl;
        }

        // 특정 워크스페이스의 모든 멤버 조회 (네이티브 쿼리 사용)
        List<WorkspaceMemberEntity> workspaceMembers =
                workspaceMemberRepository.findMembersByWorkspaceIdNative(workspaceId);

        for (WorkspaceMemberEntity member : workspaceMembers) {
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
            notification.setNotificationUrl(notificationUrl); // URL 추가

            notificationService.sendNotification(notification);
        }
    }
}
