package net.scit.backend.workdata.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workdata.entity.WorkdataEntity;

@Getter
public class WorkdataCreatedEvent implements BasedUpdatedEvent {
    private final WorkdataEntity workdata;
    private final String createdBy;

    public WorkdataCreatedEvent(WorkdataEntity workdata, String createdBy) {
        this.workdata = workdata;
        this.createdBy = createdBy;
    }

    @Override
    public String getUpdatedBy() {
        return createdBy;
    }

    @Override
    public Long getEntityId() {
        return workdata.getDataNumber();
    }

    @Override
    public String getNotificationName() {
        return "새 작업 데이터 추가됨";
    }

    @Override
    public String getNotificationType() {
        return "workdata_create";
    }

    @Override
    public String getNotificationContent() {
        return "새로운 작업 데이터가 생성되었습니다.";
    }
}
