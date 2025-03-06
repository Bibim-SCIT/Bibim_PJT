package net.scit.backend.schedule.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.schedule.entity.ScheduleEntity;

/**
 * 스케줄 정보 수정 이벤트 (이전 ScheduleUpdatedEvent)
 */
@Getter
public class ScheduleInfoUpdatedEvent implements BasedUpdatedEvent {
    private final ScheduleEntity schedule;
    private final String updatedBy;

    public ScheduleInfoUpdatedEvent(ScheduleEntity schedule, String updatedBy) {
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
        return "스케줄 정보 변경됨";
    }

    @Override
    public String getNotificationType() {
        return "schedule_info_update";
    }

    @Override
    public String getNotificationContent() {
        return "스케줄 정보가 수정되었습니다.";
    }
}