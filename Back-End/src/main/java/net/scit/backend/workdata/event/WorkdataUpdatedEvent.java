package net.scit.backend.workdata.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workdata.entity.WorkdataEntity;

@Getter
public class WorkdataUpdatedEvent implements BasedUpdatedEvent {
    private final WorkdataEntity workdata;
    private final String updatedBy; // 변경을 수행한 사용자 (작성자 또는 관리자)

    public WorkdataUpdatedEvent(WorkdataEntity workdata, String updatedBy) {
        this.workdata = workdata;
        this.updatedBy = updatedBy;
    }

    @Override
    public String getUpdatedBy() {
        return updatedBy;
    }

    @Override
    public Long getEntityId() {
        return workdata.getDataNumber();
    }

    @Override
    public String getNotificationName() {
        return "작업 데이터 변경됨";
    }

    @Override
    public String getNotificationType() {
        return "workdata_update";
    }

    @Override
    public String getNotificationContent() {
        return "작업 데이터가 변경되었습니다.";
    }
}
