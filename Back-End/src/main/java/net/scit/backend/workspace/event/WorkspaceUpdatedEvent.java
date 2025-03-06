package net.scit.backend.workspace.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Getter
public class WorkspaceUpdatedEvent implements BasedUpdatedEvent {
    private final WorkspaceEntity workspace;
    private final String updatedBy; // 변경을 수행한 사용자 (관리자 또는 본인)

    public WorkspaceUpdatedEvent(WorkspaceEntity workspace, String updatedBy) {
        this.workspace = workspace;
        this.updatedBy = updatedBy;
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
        return "워크스페이스 변경됨";
    }

    @Override
    public String getNotificationType() {
        return "workspace_update";
    }

    @Override
    public String getNotificationContent() {
        return "워크스페이스 정보가 변경되었습니다.";
    }
}
