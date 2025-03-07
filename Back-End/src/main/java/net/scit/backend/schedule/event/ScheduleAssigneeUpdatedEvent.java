package net.scit.backend.schedule.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.schedule.entity.ScheduleEntity;
import net.scit.backend.member.entity.MemberEntity;

/**
 * 스케줄 담당자 지정 이벤트
 */
@Getter
public class ScheduleAssigneeUpdatedEvent implements BasedUpdatedEvent {
    private final ScheduleEntity schedule;
    private final MemberEntity assignedMember;
    private final String updatedBy;

    public ScheduleAssigneeUpdatedEvent(ScheduleEntity schedule, MemberEntity assignedMember, String updatedBy) {
        this.schedule = schedule;
        this.assignedMember = assignedMember;
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
        return "스케줄 담당자 변경됨";
    }

    @Override
    public String getNotificationType() {
        return "schedule_assignee_update";
    }

    @Override
    public String getNotificationContent() {
        return String.format("스케줄 담당자가 '%s'(으)로 변경되었습니다.", assignedMember.getEmail());
    }
}