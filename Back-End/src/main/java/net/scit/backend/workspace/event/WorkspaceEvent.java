package net.scit.backend.workspace.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Getter
public class WorkspaceEvent implements BasedUpdatedEvent {
    private final WorkspaceEntity workspace;
    private final String senderEmail;      // 변경을 수행한 사용자 (이벤트 발생자)
    private final String senderNickname;   // 이벤트 발생자의 닉네임
    private final String eventType;        // 이벤트 타입 (create, update 등)
    private final String receiverEmail;        // 변경이 영향을 미치는 대상의 이메일
    private final String receiverNickname; // 변경이 영향을 미치는 대상의 닉네임

    public WorkspaceEvent(WorkspaceEntity workspace, String senderEmail, String senderNickname,
                          String eventType, String receiverEmail, String receiverNickname) {
        this.workspace = workspace;
        this.senderEmail = senderEmail;
        this.senderNickname = senderNickname;
        this.eventType = eventType;
        this.receiverEmail = receiverEmail;
        this.receiverNickname = receiverNickname;
    }

    // `BasedUpdatedEvent` 인터페이스 메서드 구현 (에러 해결)
    @Override
    public String getUpdatedBy() {
        return senderEmail;  // 변경을 수행한 사용자의 이메일 반환
    }

    @Override
    public Long getEntityId() {
        return workspace.getWsId();
    }

    @Override
    public String getNotificationName() {
        String workspaceName = workspace.getWsName();
        switch (eventType) {
            case "create":
                return String.format("%s님이 %s 워크스페이스를 생성하였습니다", senderNickname, workspaceName);
            case "delete":
                return String.format("%s님이 %s 워크스페이스를 삭제하였습니다", senderNickname, workspaceName);
            case "update":
                return String.format("%s님이 %s 워크스페이스를 수정하였습니다", senderNickname, workspaceName);
            case "grant":
                return String.format("%s님이 %s님에게 %s의 권한을 부여하였습니다",
                        senderNickname, receiverNickname, workspaceName);
            case "invite":
                return String.format("%s님이 %s님을 %s 워크스페이스에 초대하였습니다",
                        senderNickname, receiverNickname, workspaceName);
            case "join":
                return String.format("%s님이 %s 워크스페이스에 가입하였습니다", receiverNickname, workspaceName);
            case "member_update":
                return String.format("%s님의 %s 워크스페이스 내 회원 정보가 수정되었습니다",
                        senderNickname, workspaceName);
            case "role_update":
                return String.format("%s님이 %s님의 %s 워크스페이스 역할을 변경하였습니다",
                        senderNickname, receiverNickname, workspaceName);
            case "withdraw":
                return String.format("%s님이 %s 워크스페이스를 탈퇴하였습니다", receiverNickname, workspaceName);
            default:
                return "워크스페이스 이벤트";
        }
    }

    @Override
    public String getNotificationType() {
        return "workspace_" + eventType;
    }

    @Override
    public String getNotificationContent() {
        return "워크스페이스 관련 작업이 수행되었습니다: " + eventType;
    }
}


