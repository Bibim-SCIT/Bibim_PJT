package net.scit.backend.notification.event;

public interface BasedUpdatedEvent {

    String getUpdatedBy();  // 변경한 사용자
    Long getEntityId();     // 변경된 엔티티 ID
    String getNotificationName(); // 알림 제목
    String getNotificationType(); // 알림 타입
    String getNotificationContent(); // 알림 내용
}
