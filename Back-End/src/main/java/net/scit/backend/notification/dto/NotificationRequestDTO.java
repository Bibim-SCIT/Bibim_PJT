package net.scit.backend.notification.dto;

import lombok.Data;

@Data
public class NotificationRequestDTO {
    private Long workspaceId;
    private String senderEmail;      // 알림을 보낸 사람의 이메일
    private String senderNickname;   // 알림을 보낸 사람의 닉네임
    private String receiverEmail;    // 알림을 받는 사람의 이메일
    private String receiverNickname; // 알림을 받는 사람의 닉네임

    private String notificationName;    // 알림 제목
    private String notificationType;    // 알림 유형 (ex. workdata_create, schedule_update 등)
    private String notificationContent; // 알림 내용
}
