package net.scit.backend.workspace.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.service.NotificationService;
import net.scit.backend.workspace.event.WorkspaceChannelEvent;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkspaceChannelEventListener {

    private final NotificationService notificationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @EventListener
    public void handleWorkspaceChannelEvent(WorkspaceChannelEvent event) {
        String notificationMessage = event.getNotificationContent();
        Long wsId = event.getWorkspace().getWsId();
        Long channelNumber = event.getChannelNumber() != null ? event.getChannelNumber() : 0L; // 0L if null

        log.info("📢 워크스페이스 채널 이벤트 감지: {} | 워크스페이스 ID: {} | 메시지: {}",
                event.getEventType(), wsId, notificationMessage);

        // 기본 주소 설정 (워크스페이스 컨트롤러 기준)
        final String baseUrl = "http://localhost:8080/workspace";
        String notificationUrl;
        switch (event.getEventType()) {
            case "create":
            case "update":
                // 채널 상세 페이지: /workspace/{wsId}/channel/{channelNumber}
                notificationUrl = String.format("%s/%d/channel/%d", baseUrl, wsId, channelNumber);
                break;
            case "delete":
                // 삭제 시 목록 페이지: /workspace/{wsId}/channel
                notificationUrl = String.format("%s/%d/channel", baseUrl, wsId);
                break;
            default:
                notificationUrl = baseUrl;
        }

        // 워크스페이스 내 모든 멤버 조회
        List<WorkspaceMemberEntity> workspaceMembers =
                workspaceMemberRepository.findMembersByWorkspaceIdNative(wsId);

        for (WorkspaceMemberEntity member : workspaceMembers) {
            NotificationEntity notification = new NotificationEntity();
            notification.setWsId(wsId);
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

            notificationService.sendNotification(notification);
        }
    }
}
