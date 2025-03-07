package net.scit.backend.schedule.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.schedule.entity.ScheduleEntity;

/**
 * 스케줄 상태 변경 이벤트
 */
@Getter
public class ScheduleStatusUpdatedEvent implements BasedUpdatedEvent {
    private final ScheduleEntity schedule;
    private final String updatedBy;  // 변경을 수행한 사용자

    public ScheduleStatusUpdatedEvent(ScheduleEntity schedule, String updatedBy) {
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
        return "스케줄 상태 변경됨";
    }

    @Override
    public String getNotificationType() {
        return "schedule_status_update";
    }

    @Override
    public String getNotificationContent() {
        return String.format("스케줄 [%d]의 상태가 변경되었습니다.", schedule.getScheduleNumber());
    }
}
