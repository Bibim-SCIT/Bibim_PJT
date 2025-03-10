package net.scit.backend.workdata.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.workdata.event.WorkdataEvent;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkdataEventListener {

    private final NotificationService notificationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @EventListener
    public void handleWorkdataEvent(WorkdataEvent event) {
        String notificationMessage = event.getNotificationContent();
        Long workspaceId = event.getWorkdata().getWorkspace().getWsId();
        Long dataNumber = event.getWorkdata().getDataNumber();

        log.info("📢 Workdata 이벤트 감지: {} | 워크스페이스 ID: {} | 메시지: {}",
                event.getEventType(), workspaceId, notificationMessage);

        // 기본 주소 설정 (WorkdataController의 매핑 기준)
        final String baseUrl = "http://localhost:8080/workdata";
        String notificationUrl;
        switch (event.getEventType()) {
            case "create":
            case "update":
                // 상세 페이지: /workdata/{wsId}/{dataNumber}
                notificationUrl = String.format("%s/%d/%d", baseUrl, workspaceId, dataNumber);
                break;
            case "delete":
                // 삭제 시 목록 페이지: /workdata/{wsId}
                notificationUrl = String.format("%s/%d", baseUrl, workspaceId);
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
            notification.setNotificationUrl(notificationUrl);  // URL 설정

            notificationService.sendNotification(notification);
        }
    }
}
