//package net.scit.backend.member.event;
//
//import lombok.Getter;
//import net.scit.backend.member.entity.MemberEntity;
//import net.scit.backend.notification.event.BasedUpdatedEvent;
//
//@Getter
//public class MemberUpdatedEvent implements BasedUpdatedEvent {
//
//    private final MemberEntity member;
//    private final String updatedBy;
//    private final String notificationName;
//    private final String notificationType;
//    private final String notificationContent;
//
//    /**
//     * 생성자
//     * @param member 수정 대상 회원 엔티티
//     * @param updatedBy 수정한 사용자(일반적으로 본인)
//     * @param notificationName 알림 제목
//     * @param notificationType 알림 타입 (예: "member_update", "password_update")
//     */
//    public MemberUpdatedEvent(MemberEntity member, String updatedBy, String notificationName, String notificationType) {
//        this.member = member;
//        this.updatedBy = updatedBy;
//        this.notificationName = notificationName;
//        this.notificationType = notificationType;
//        this.notificationContent = generateNotificationContent(notificationType);
//    }
//
//    @Override
//    public String getUpdatedBy() {
//        return updatedBy;
//    }
//
//    @Override
//    public Long getEntityId() {
//        // MemberEntity의 PK는 email이므로, 대체 ID로 email의 hashCode를 사용 (고유 식별자로 활용)
//        return (long) member.getEmail().hashCode();
//    }
//
//    @Override
//    public String getNotificationName() {
//        return notificationName;
//    }
//
//    @Override
//    public String getNotificationType() {
//        return notificationType;
//    }
//
//    @Override
//    public String getNotificationContent() {
//        return notificationContent;
//    }
//
//    /**
//     * 알림 타입에 따라 적절한 알림 메시지 생성
//     */
//    private String generateNotificationContent(String type) {
//        return switch (type) {
//            case "member_update" -> "회원님의 개인정보가 변경되었습니다. 확인해 주세요.";
//            case "password_update" -> "회원님의 비밀번호가 변경되었습니다. 본인이 변경하지 않았다면 즉시 확인하세요.";
//            default -> "회원 정보가 업데이트되었습니다.";
//        };
//    }
//}
