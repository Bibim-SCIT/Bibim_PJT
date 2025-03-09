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

        log.info("📢 Workdata 이벤트 감지: {} | 워크스페이스 ID: {} | 메시지: {}",
                event.getEventType(), workspaceId, notificationMessage);

        // ✅ Repository를 통해 특정 워크스페이스의 모든 멤버 조회 (네이티브 쿼리 사용)
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findMembersByWorkspaceIdNative(workspaceId);

        for (WorkspaceMemberEntity member : workspaceMembers) {
            NotificationEntity notification = new NotificationEntity();
            notification.setWsId(workspaceId);
            notification.setSenderEmail(event.getSenderEmail());
            notification.setSenderNickname(event.getSenderNickname());
            notification.setReceiverEmail(member.getMember().getEmail()); // MemberEntity의 이메일
            notification.setReceiverNickname(member.getNickname());       // WorkspaceMemberEntity의 닉네임
            notification.setNotificationName(event.getNotificationName());
            notification.setNotificationType(event.getNotificationType());
            notification.setNotificationContent(notificationMessage);
            notification.setNotificationStatus(false);
            notification.setNotificationDate(LocalDateTime.now());

            notificationService.sendNotification(notification);
        }
    }
}
