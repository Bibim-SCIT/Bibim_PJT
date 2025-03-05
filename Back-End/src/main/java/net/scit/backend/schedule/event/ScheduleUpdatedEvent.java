package net.scit.backend.schedule.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.schedule.entity.ScheduleEntity;

@Getter
public class ScheduleUpdatedEvent implements BasedUpdatedEvent {
    private final ScheduleEntity schedule;
    private final String updatedBy; // 변경을 수행한 사용자 (일정 생성자 또는 관리자)

    public ScheduleUpdatedEvent(ScheduleEntity schedule, String updatedBy) {
        this.schedule = schedule;
        this.updatedBy = updatedBy;
    }

    @Override
    public String getUpdatedBy() {
        return updatedBy;
    }

    @Override
    public Long getEntityId() {
        return schedule.getScheduleNumber();
    }

    @Override
    public String getNotificationName() {
        return "일정 변경됨";
    }

    @Override
    public String getNotificationType() {
        return "schedule_update";
    }

    @Override
    public String getNotificationContent() {
        return "일정이 변경되었습니다.";
    }
}
