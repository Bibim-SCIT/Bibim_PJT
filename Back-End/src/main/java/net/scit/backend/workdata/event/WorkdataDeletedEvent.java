package net.scit.backend.workdata.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workdata.entity.WorkdataEntity;

@Getter
public class WorkdataDeletedEvent implements BasedUpdatedEvent {
    private final WorkdataEntity workdata;
    private final String deletedBy;

    public WorkdataDeletedEvent(WorkdataEntity workdata, String deletedBy) {
        this.workdata = workdata;
        this.deletedBy = deletedBy;
    }

    @Override
    public String getUpdatedBy() {
        return deletedBy;
    }

    @Override
    public Long getEntityId() {
        return workdata.getDataNumber();
    }

    @Override
    public String getNotificationName() {
        return "작업 데이터 삭제됨";
    }

    @Override
    public String getNotificationType() {
        return "workdata_delete";
    }

    @Override
    public String getNotificationContent() {
        return "작업 데이터가 삭제되었습니다.";
    }
}
