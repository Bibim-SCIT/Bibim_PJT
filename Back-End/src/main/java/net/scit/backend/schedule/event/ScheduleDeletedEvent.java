package net.scit.backend.schedule.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.schedule.entity.ScheduleEntity;

@Getter
public class ScheduleDeletedEvent implements BasedUpdatedEvent {
    private final ScheduleEntity schedule;
    private final String deletedBy;

    public ScheduleDeletedEvent(ScheduleEntity schedule, String deletedBy) {
        this.schedule = schedule;
        this.deletedBy = deletedBy;
    }

    @Override
    public String getUpdatedBy() {
        return deletedBy;
    }

    @Override
    public Long getEntityId() {
        return schedule.getScheduleNumber();
    }

    @Override
    public String getNotificationName() {
        return "스케줄 삭제됨";
    }

    @Override
    public String getNotificationType() {
        return "schedule_delete";
    }

    @Override
    public String getNotificationContent() {
        return "스케줄이 삭제되었습니다.";
    }
}
