package net.scit.backend.notification.service;

import net.scit.backend.notification.entity.NotificationEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

public interface NotificationService {

    void createNotification(String memberEmail, Long workspaceId, Long scheduleNumber, Long recordNumber, Long workdataNumber,
                            String notificationName, String notificationType, String notificationContent);

    SseEmitter subscribe(String memberEmail);
    void sendNotification(NotificationEntity notification);

    List<NotificationEntity> getUnreadNotifications(String memberEmail);

    boolean markAsRead(Long notificationNumber);

    boolean markAllAsRead(String memberEmail);

    boolean deleteNotification(Long notificationNumber);
}
