package net.scit.backend.member.event;

import lombok.Getter;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.notification.event.BasedUpdatedEvent;

@Getter
public class MemberEvent implements BasedUpdatedEvent {

    private final MemberEntity member;      // 이벤트 대상 회원
    private final String senderEmail;       // 이벤트를 발생시킨 사용자(보통 본인)
    private final String senderName;        // 이벤트를 발생시킨 사용자의 이름
    private final String eventType;         // "member_update" 또는 "password_update"

    public MemberEvent(MemberEntity member, String senderEmail, String senderName, String eventType) {
        this.member = member;
        this.senderEmail = senderEmail;
        this.senderName = senderName;  // 닉네임 대신 name 사용
        this.eventType = eventType;
    }

    @Override
    public String getUpdatedBy() {
        return senderEmail;
    }

    @Override
    public Long getEntityId() {
        // MemberEntity의 기본키가 email이므로, hashCode를 이용해 고유 ID로 활용
        return (long) member.getEmail().hashCode();
    }

    @Override
    public String getNotificationName() {
        switch (eventType) {
            case "member_update":
                return String.format("%s님, 회원 정보가 수정되었습니다.", senderName);
            case "password_update":
                return String.format("%s님, 비밀번호가 변경되었습니다.", senderName);
            default:
                return "회원 관련 이벤트";
        }
    }

    @Override
    public String getNotificationType() {
        return "member_" + eventType;
    }

    @Override
    public String getNotificationContent() {
        switch (eventType) {
            case "member_update":
                return "회원님의 개인정보가 변경되었습니다. 확인해 주세요.";
            case "password_update":
                return "회원님의 비밀번호가 변경되었습니다. 본인이 변경하지 않았다면 즉시 확인하시기 바랍니다.";
            default:
                return "회원 정보가 업데이트되었습니다.";
        }
    }
}
