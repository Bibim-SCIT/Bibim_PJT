package net.scit.backend.notification.dto;

import lombok.Data;

@Data
public class NotificationRequestDTO {
    private Long workspaceId;
    private Long scheduleNumber;
    private Long recordNumber;
    private Long workdataNumber;
    private String notificationName;
    private String notificationType;
    private String notificationContent;
}
