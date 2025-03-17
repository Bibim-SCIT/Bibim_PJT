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
        // 수정된 부분: 워크스페이스 이름(wsName) 포함
        String wsName = schedule.getWorkspace().getWsName();
        return switch (eventType) {
            case "create" -> "스케줄 등록";
            case "delete" -> "스케줄 삭제";
            case "info_update" -> "스케줄 정보 수정";
            case "assignee_update" -> "스케줄 담당자 변경";
            case "status_update" -> "스케줄 상태 변경";
            default -> "스케줄 이벤트";
        };
    }

    @Override
    public String getNotificationType() {
        return "schedule_" + eventType;
    }

    @Override
    public String getNotificationContent() {
        // 수정된 부분: 워크스페이스 이름(wsName) 포함
        String wsName = schedule.getWorkspace().getWsName();
        return switch (eventType) {
            case "create" -> String.format("%s 워크스페이스에서 새로운 스케줄이 생성되었습니다.", wsName);
            case "delete" -> String.format("%s 워크스페이스에서 스케줄이 삭제되었습니다.", wsName);
            case "info_update" -> String.format("%s 워크스페이스에서 스케줄 정보가 수정되었습니다.", wsName);
            case "assignee_update" -> String.format("%s 워크스페이스에서 스케줄 담당자가 변경되었습니다.", wsName);
            case "status_update" ->
                    String.format("%s 워크스페이스에서 스케줄 [%d]의 상태가 변경되었습니다.", wsName, schedule.getScheduleNumber());
            default -> "스케줄 관련 이벤트가 발생하였습니다.";
        };
    }
}
