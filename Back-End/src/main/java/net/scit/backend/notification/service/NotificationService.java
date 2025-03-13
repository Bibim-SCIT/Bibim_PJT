package net.scit.backend.notification.service;

import net.scit.backend.notification.dto.NotificationResponseDTO;
import net.scit.backend.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;

public interface NotificationService {

    // 새 알림 생성 및 SSE 전송 (DTO 반환)
    NotificationResponseDTO createAndSendNotification(NotificationEntity notification);

    // SSE 구독(Emitter 생성)
    SseEmitter subscribe(String receiverEmail);

    // SSE 구독 해제(Emitter 제거)
    void unsubscribe(String receiverEmail);

    // 단순 알림 전송 (SSE)
    NotificationEntity sendNotification(NotificationEntity notification);

    // 읽지 않은 알림 조회 (페이징)
    Page<NotificationEntity> getUnreadNotifications(String receiverEmail, Pageable pageable);

    // 읽은 알림 조회 (페이징)
    Page<NotificationEntity> getReadNotifications(String receiverEmail, Pageable pageable);

    boolean markAsRead(Long notificationNumber);

    boolean markAllAsRead(String receiverEmail);

    boolean deleteNotification(Long notificationNumber);

    // 알림 URL 조회 (리다이렉트용)
    String getNotificationUrl(Long notificationId);
}
