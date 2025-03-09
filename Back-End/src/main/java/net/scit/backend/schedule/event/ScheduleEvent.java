package net.scit.backend.schedule.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.schedule.entity.ScheduleEntity;

@Getter
public class ScheduleEvent implements BasedUpdatedEvent {

    private final ScheduleEntity schedule;
    private final String senderEmail;      // 이벤트 발생자 (스케줄 작업 수행자)
    private final String senderNickname;   // 이벤트 발생자의 닉네임
    private final String eventType;        // 이벤트 타입 ("create", "delete", "info_update", "assignee_update", "status_update")

    public ScheduleEvent(ScheduleEntity schedule, String senderEmail, String senderNickname, String eventType) {
        this.schedule = schedule;
        this.senderEmail = senderEmail;
        this.senderNickname = senderNickname;
        this.eventType = eventType;
    }

    @Override
    public String getUpdatedBy() {
        return senderEmail;
    }

    @Override
    public Long getEntityId() {
        return schedule.getScheduleNumber();
    }

    @Override
    public String getNotificationName() {
        switch (eventType) {
            case "create":
                return String.format("%s님이 새로운 스케줄을 생성하였습니다.", senderNickname);
            case "delete":
                return String.format("%s님이 스케줄을 삭제하였습니다.", senderNickname);
            case "info_update":
                return String.format("%s님이 스케줄 정보를 수정하였습니다.", senderNickname);
            case "assignee_update":
                return String.format("%s님이 스케줄 담당자를 변경하였습니다.", senderNickname);
            case "status_update":
                return String.format("%s님이 스케줄 상태를 변경하였습니다.", senderNickname);
            default:
                return "스케줄 이벤트";
        }
    }

    @Override
    public String getNotificationType() {
        return "schedule_" + eventType;
    }

    @Override
    public String getNotificationContent() {
        switch (eventType) {
            case "create":
                return "새로운 스케줄이 생성되었습니다.";
            case "delete":
                return "스케줄이 삭제되었습니다.";
            case "info_update":
                return "스케줄 정보가 수정되었습니다.";
            case "assignee_update":
                return "스케줄 담당자가 변경되었습니다.";
            case "status_update":
                return String.format("스케줄 [%d]의 상태가 변경되었습니다.", schedule.getScheduleNumber());
            default:
                return "스케줄 관련 이벤트가 발생하였습니다.";
        }
    }
}
