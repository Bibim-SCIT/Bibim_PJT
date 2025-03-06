package net.scit.backend.member.event;

import lombok.Getter;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.notification.event.BasedUpdatedEvent;

@Getter
public class MemberUpdatedEvent implements BasedUpdatedEvent {  //BaseUpdatedEvent를 상속받아 회원 정보 변경 이벤트를 처리

    private final MemberEntity member;
    private final String updatedBy; // 변경을 수행한 사용자 (관리자 또는 본인)

    public MemberUpdatedEvent(MemberEntity member, String updatedBy) {
        this.member = member;
        this.updatedBy = updatedBy;
    }

    @Override
    public String getUpdatedBy() {
        return updatedBy;
    }

    @Override
    public Long getEntityId() {
        return null; // MemberEntity는 String 타입의 email이 PK이므로 사용하지 않음
    }

    @Override
    public String getNotificationName() {
        return "회원 정보 변경";
    }

    @Override
    public String getNotificationType() {
        return "member_update";
    }

    @Override
    public String getNotificationContent() {
        return "회원 정보가 변경되었습니다.";
    }
}
