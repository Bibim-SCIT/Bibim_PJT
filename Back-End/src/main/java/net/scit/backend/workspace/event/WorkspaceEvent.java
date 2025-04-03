package net.scit.backend.workspace.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Getter
public class WorkspaceEvent implements BasedUpdatedEvent {

    // 일반 이벤트용: 생성, 수정 등에서는 기존 엔티티를 사용
    private final WorkspaceEntity workspace;

    // delete 이벤트 전용: workspace 대신 필요한 정보만 전달
    private final Long wsId;
    private final String wsName;

    private final String senderEmail;
    private final String senderNickname;
    private final String eventType;
    private final String receiverEmail;
    private final String receiverNickname;

    // 기존 생성자 (create, update 등)
    public WorkspaceEvent(WorkspaceEntity workspace, String senderEmail, String senderNickname,
                          String eventType, String receiverEmail, String receiverNickname) {
        this.workspace = workspace;
        this.wsId = null;
        this.wsName = null;
        this.senderEmail = senderEmail;
        this.senderNickname = senderNickname;
        // 강제 소문자화 및 trim하여 저장
        this.eventType = eventType.trim().toLowerCase();
        this.receiverEmail = receiverEmail;
        this.receiverNickname = receiverNickname;
    }

    // delete 이벤트 전용 생성자 (wsId, wsName만 전달)
    public WorkspaceEvent(Long wsId, String wsName, String senderEmail, String senderNickname,
                          String eventType, String receiverEmail, String receiverNickname, WorkspaceEntity workspace) {
        this.workspace = workspace;
        this.wsId = wsId;
        this.wsName = wsName;
        this.senderEmail = senderEmail;
        this.senderNickname = senderNickname;
        this.eventType = eventType.trim().toLowerCase();
        this.receiverEmail = receiverEmail;
        this.receiverNickname = receiverNickname;
    }

    @Override
    public String getUpdatedBy() {
        return senderEmail;
    }

    @Override
    public Long getEntityId() {
        return "delete".equals(eventType) ? wsId : workspace.getWsId();
    }

    @Override
    public String getNotificationName() {
        // delete 이벤트의 경우 wsName을, 그 외에는 workspace.getWsName()을 사용
        String name = "delete".equals(eventType) ? wsName : workspace.getWsName();
        return switch (eventType) {
            case "create" -> "워크스페이스 생성";
            case "delete" -> "워크스페이스 삭제";
            case "update" -> "워크스페이스 수정";
            case "grant" -> "워크스페이스 내 권한 부여";
            case "invite" -> "워크스페이스 초대";
            case "join" -> "워크스페이스 가입";
            case "member_update" -> "워크스페이스 내 회원 정보 수정";
            case "role_update" -> "워크스페이스 역할 변경";
            case "withdraw" -> "워크스페이스 탈퇴";
            default -> "워크스페이스 이벤트";
        };
    }

    @Override
    public String getNotificationContent() {
        String name = "delete".equals(eventType) ? wsName : workspace.getWsName();
        return switch (eventType) {
            case "create" -> String.format("%s 워크스페이스가 생성되었습니다.", name);
            case "update" -> String.format("%s 워크스페이스가 수정되었습니다.", name);
            case "delete" -> String.format("%s 워크스페이스가 삭제되었습니다.", name);
            case "grant" -> String.format("%s님이 %s님에게 %s 워크스페이스의 권한을 부여하였습니다.", senderNickname, receiverNickname, name);
            case "invite" -> String.format("%s님이 %s님을 %s 워크스페이스에 초대하였습니다.", senderNickname, receiverNickname, name);
            case "join" -> String.format("%s님이 %s 워크스페이스에 가입하였습니다.", receiverNickname, name);
            case "member_update" -> String.format("%s님의 %s 워크스페이스 내 회원 정보가 수정되었습니다.", senderNickname, name);
            case "role_update" -> String.format("%s님이 %s님의 %s 워크스페이스 역할을 변경하였습니다.", senderNickname, receiverNickname, name);
            case "withdraw" -> String.format("%s님이 %s 워크스페이스를 탈퇴하였습니다.", receiverNickname, name);
            default -> "워크스페이스 관련 이벤트가 발생하였습니다.";
        };
    }

    @Override
    public String getNotificationType() {
        return "workspace_" + eventType;
    }
}