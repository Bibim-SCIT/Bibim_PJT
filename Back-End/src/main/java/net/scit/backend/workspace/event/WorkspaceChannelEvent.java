package net.scit.backend.workspace.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Getter
public class WorkspaceChannelEvent implements BasedUpdatedEvent {
    private final WorkspaceEntity workspace;
    private final String senderEmail;      // 이벤트 발생자 (채널 작업 수행자)
    private final String senderNickname;   // 이벤트 발생자의 이름 (예: 본인의 이름)
    private final String eventType;        // "create", "update", "delete"
    private final String channelName;      // 채널 이름
    private final Long channelNumber;      // 채널 번호 (채널 삭제의 경우 null일 수 있음)

    public WorkspaceChannelEvent(WorkspaceEntity workspace, String senderEmail, String senderNickname,
                                 String eventType, String channelName, Long channelNumber) {
        this.workspace = workspace;
        this.senderEmail = senderEmail;
        this.senderNickname = senderNickname;
        this.eventType = eventType;
        this.channelName = channelName;
        this.channelNumber = channelNumber;
    }

    @Override
    public String getUpdatedBy() {
        return senderEmail;
    }

    @Override
    public Long getEntityId() {
        // 워크스페이스 ID를 기본 식별자로 사용합니다.
        return workspace.getWsId();
    }

    @Override
    public String getNotificationName() {
        String wsName = workspace.getWsName();
        return switch (eventType) {
            case "create" -> "워크스페이스 채널 생성";
            case "update" -> "워크스페이스 채널 수정";
            case "delete" -> "워크스페이스 채널 삭제";
            default -> "워크스페이스 채널 이벤트";
        };
    }

    @Override
    public String getNotificationType() {
        return "workspace_channel_" + eventType;
    }

    @Override
    public String getNotificationContent() {
        String wsName = workspace.getWsName();
        return switch (eventType) {
            case "create" -> String.format("%s 워크스페이스에서 %s 채널이 생성되었습니다.", wsName, channelName);
            case "update" -> String.format("%s 워크스페이스에서 %s 채널이 수정되었습니다.", wsName, channelName);
            case "delete" -> String.format("%s 워크스페이스에서 %s 채널이 삭제되었습니다.", wsName, channelName);
            default -> "워크스페이스 채널 관련 이벤트가 발생하였습니다.";
        };
    }
}
