package net.scit.backend.notification.service;

import net.scit.backend.notification.dto.NotificationResponseDTO;
import net.scit.backend.notification.entity.NotificationEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;

public interface NotificationService {

    // 수정: sender와 receiver 정보를 모두 포함
//    void createNotification(String senderEmail, String senderNickname,
//                            String receiverEmail, String receiverNickname,
//                            Long workspaceId, Long scheduleNumber, Long recordNumber, Long workdataNumber,
//                            String notificationName, String notificationType, String notificationContent);

    //실제 알림 생성 및 DTO 반환
    NotificationResponseDTO createAndSendNotification(NotificationEntity notification); // ✅ 추가된 메서드


    // SSE 구독(Emitter 생성)
    SseEmitter subscribe(String receiverEmail);

    // SSE 구독 해제(Emitter 제거)
    void unsubscribe(String receiverEmail);


    NotificationEntity sendNotification(NotificationEntity notification);

    // 읽지 않은 알림 조회는 receiverEmail 기준
    List<NotificationEntity> getUnreadNotifications(String receiverEmail);

    boolean markAsRead(Long notificationNumber);

    boolean markAllAsRead(String receiverEmail);

    boolean deleteNotification(Long notificationNumber);

    // 알림 ID로 알림 URL을 조회하는 메서드
    String getNotificationUrl(Long notificationId);
}
