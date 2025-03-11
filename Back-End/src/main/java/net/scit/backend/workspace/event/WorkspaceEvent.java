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
                          String eventType, String receiverEmail, String receiverNickname) {
        this.workspace = null;
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
        switch (eventType) {
            case "create":
                return String.format("%s님이 %s 워크스페이스를 생성하였습니다", senderNickname, name);
            case "delete":
                return String.format("%s님이 %s 워크스페이스를 삭제하였습니다", senderNickname, name);
            case "update":
                return String.format("%s님이 %s 워크스페이스를 수정하였습니다", senderNickname, name);
            case "grant":
                return String.format("%s님이 %s님에게 %s의 권한을 부여하였습니다", senderNickname, receiverNickname, name);
            case "invite":
                return String.format("%s님이 %s님을 %s 워크스페이스에 초대하였습니다", senderNickname, receiverNickname, name);
            case "join":
                return String.format("%s님이 %s 워크스페이스에 가입하였습니다", receiverNickname, name);
            case "member_update":
                return String.format("%s님의 %s 워크스페이스 내 회원 정보가 수정되었습니다", senderNickname, name);
            case "role_update":
                return String.format("%s님이 %s님의 %s 워크스페이스 역할을 변경하였습니다", senderNickname, receiverNickname, name);
            case "withdraw":
                return String.format("%s님이 %s 워크스페이스를 탈퇴하였습니다", receiverNickname, name);
            default:
                return "워크스페이스 이벤트";
        }
    }

    @Override
    public String getNotificationContent() {
        return getNotificationName();
    }

    @Override
    public String getNotificationType() {
        return "workspace_" + eventType;
    }
}
