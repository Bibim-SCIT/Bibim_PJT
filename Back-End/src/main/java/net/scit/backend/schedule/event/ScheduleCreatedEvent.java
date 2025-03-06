package net.scit.backend.schedule.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.schedule.entity.ScheduleEntity;

@Getter
public class ScheduleCreatedEvent implements BasedUpdatedEvent {
    private final ScheduleEntity schedule;
    private final String createdBy;

    public ScheduleCreatedEvent(ScheduleEntity schedule, String createdBy) {
        this.schedule = schedule;
        this.createdBy = createdBy;
    }

    @Override
    public String getUpdatedBy() {
        return createdBy;
    }

    @Override
    public Long getEntityId() {
        return schedule.getScheduleNumber();
    }

    @Override
    public String getNotificationName() {
        return "새 스케줄 생성됨";
    }

    @Override
    public String getNotificationType() {
        return "schedule_create";
    }

    @Override
    public String getNotificationContent() {
        return "새로운 스케줄이 생성되었습니다.";
    }
}
