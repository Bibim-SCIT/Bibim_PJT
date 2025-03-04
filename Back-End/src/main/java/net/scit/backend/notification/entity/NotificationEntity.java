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
    private Long notificationNumber; // PK, 자동 증가

    @Column(nullable = false, length = 255)
    private String memberEmail; // 알림 대상 사용자 이메일

    private Long workspaceId; // 워크스페이스 ID (NULL 가능)
    private Long scheduleNumber; // 스케줄 ID (NULL 가능)
    private Long recordNumber; // 회의록 ID (NULL 가능)
    private Long workdataNumber; // 작업 데이터 ID (NULL 가능)

    @Column(nullable = false, length = 255)
    private String notificationName; // 알림 이름

    @Column(nullable = false, length = 255)
    private String notificationType; // 알림 유형 (ex. schedule_update, record_update)

    @Column(nullable = false)
    private boolean notificationStatus; // 읽음 여부 (false: 읽지 않음, true: 읽음)

    @Column(length = 255)
    private String notificationContent; // 알림 내용

    @Column(nullable = false)
    private LocalDateTime notificationDate; // 알림 생성일 (기본값: CURRENT_TIMESTAMP)
}
