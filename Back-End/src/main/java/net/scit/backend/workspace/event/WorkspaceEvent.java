package net.scit.backend.workspace.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Getter
public class WorkspaceEvent implements BasedUpdatedEvent {
    private final WorkspaceEntity workspace;
    private final String updatedBy;
    private final String eventType;
    // 행동 주체(이벤트 발생자)와 대상(행동의 객체)의 닉네임을 구분
    private final String actorNickname;   // 예: 수정자, 초대자, 권한 부여자 등
    private final String targetNickname;  // 예: 수정 대상, 초대받는 사람, 권한 부여 대상 등

    public WorkspaceEvent(WorkspaceEntity workspace, String updatedBy, String eventType,
                          String actorNickname, String targetNickname) {
        this.workspace = workspace;
        this.updatedBy = updatedBy;
        this.eventType = eventType;
        this.actorNickname = actorNickname;
        this.targetNickname = targetNickname;
    }

    @Override
    public String getUpdatedBy() {
        return updatedBy;
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
                // 생성 이벤트: 워크스페이스 생성은 구성원이 본인이므로, actor만 사용
                return String.format("%s님이 %s를 생성하였습니다", actorNickname, workspaceName);
            case "delete":
                return String.format("%s님이 %s를 삭제하였습니다", actorNickname, workspaceName);
            case "update":
                return String.format("%s님이 %s를 수정하였습니다", actorNickname, workspaceName);
            case "grant":
                // 권한 부여: 행동 주체와 대상 모두 필요
                return String.format("%s님이 %s님에게 %s의 권한을 부여하였습니다",
                        actorNickname, targetNickname, workspaceName);
            case "invite":
                // 초대: 행동 주체와 대상 모두 필요
                return String.format("%s님이 %s님을 %s에 초대하였습니다",
                        actorNickname, targetNickname, workspaceName);
            case "join":
                // 가입: 초대받은 사람(대상)과 행동 주체(초대자)가 모두 필요한 경우
                return String.format("%s님이 %s님의 워크스페이스의 새로운 멤버가 되었습니다",
                        actorNickname, targetNickname);
            case "member_update":
                // 회원 정보 수정: 나만 볼 수 있으므로 actor만 사용
                return String.format("%s님의 %s 워크스페이스 내 회원 정보가 수정되었습니다",
                        actorNickname, workspaceName);
            case "role_update":
                // 역할 변경: 역할을 변경한 사람 + 역할이 변경된 사람 모두 포함
                return String.format("%s님이 %s님의 %s 워크스페이스 역할을 변경하였습니다",
                        actorNickname, targetNickname, workspaceName);
            case "withdraw":
                // 탈퇴: 탈퇴한 사람이 대상이므로 targetNickname 사용
                return String.format("%s님이 %s 워크스페이스를 탈퇴하였습니다",
                        targetNickname, workspaceName);
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
