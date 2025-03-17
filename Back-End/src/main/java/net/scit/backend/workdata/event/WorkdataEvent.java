package net.scit.backend.workdata.event;

import lombok.Getter;
import net.scit.backend.notification.event.BasedUpdatedEvent;
import net.scit.backend.workdata.entity.WorkdataEntity;

@Getter
public class WorkdataEvent implements BasedUpdatedEvent {
    private final WorkdataEntity workdata;
    private final String senderEmail;      // 이벤트 발생자 (작업 변경을 수행한 사용자)
    private final String senderNickname;   // 이벤트 발생자의 닉네임
    private final String eventType;        // 이벤트 타입 ("create", "update", "delete" 등)

    public WorkdataEvent(WorkdataEntity workdata, String senderEmail, String senderNickname, String eventType) {
        this.workdata = workdata;
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
        return workdata.getDataNumber();
    }

    @Override
    public String getNotificationName() {
        String wsName = workdata.getWorkspace().getWsName();
        return switch (eventType) {
            case "create" -> "자료실 글 등록";
            case "delete" -> "자료실 글 삭제";
            case "update" -> "자료실 글 수정";
            default -> "작업 데이터 이벤트";
        };
    }

    @Override
    public String getNotificationType() {
        return "workdata_" + eventType;
    }

    @Override
    public String getNotificationContent() {
        String wsName = workdata.getWorkspace().getWsName();
        return switch (eventType) {
            case "create" -> String.format("%s 워크스페이스에서 새로운 작업 데이터가 생성되었습니다.", wsName);
            case "delete" -> String.format("%s 워크스페이스에서 작업 데이터가 삭제되었습니다.", wsName);
            case "update" -> String.format("%s 워크스페이스에서 작업 데이터가 수정되었습니다.", wsName);
            default -> "작업 데이터 관련 이벤트가 발생하였습니다.";
        };
    }
}
