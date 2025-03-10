package net.scit.backend.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notification")
public class NotificationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_number", nullable = false, updatable = false)
    private Long notificationNumber;

    private Long wsId; // 워크스페이스 ID

    @Column(nullable = false, length = 255)
    private String senderEmail; // 알림을 보낸 사람의 이메일

    @Column(nullable = false, length = 255)
    private String senderNickname; // 알림을 보낸 사람의 닉네임

    @Column(nullable = false, length = 255)
    private String receiverEmail; // 알림을 받는 사람의 이메일

    @Column(nullable = false, length = 255)
    private String receiverNickname; // 알림을 받는 사람의 닉네임

    @Column(nullable = false, length = 255)
    private String notificationName; // 알림 제목

    @Column(nullable = false, length = 255)
    private String notificationType; // 알림 유형 (ex. workdata_create, schedule_update 등)

    @Column(nullable = false)
    private boolean notificationStatus; // 읽음 여부 (false: 읽지 않음, true: 읽음)

    @Column(length = 255)
    private String notificationContent; // 알림 내용

    @Column(nullable = false)
    private LocalDateTime notificationDate; // 알림 생성일 (기본값: CURRENT_TIMESTAMP)

    private String notificationUrl;  // ✅ 알림 클릭 시 이동할 URL 추가
}
