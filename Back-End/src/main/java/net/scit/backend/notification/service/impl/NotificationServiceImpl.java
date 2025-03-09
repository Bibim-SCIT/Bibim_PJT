package net.scit.backend.notification.service.impl;

import lombok.RequiredArgsConstructor;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.repository.NotificationRepository;
import net.scit.backend.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor // Lombok을 이용한 생성자 자동 생성
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();


    // 알림 생성
    @Override
    public void createNotification(String senderEmail, String senderNickname,
                                   String receiverEmail, String receiverNickname,
                                   Long workspaceId, Long scheduleNumber, Long recordNumber, Long workdataNumber,
                                   String notificationName, String notificationType, String notificationContent) {
        NotificationEntity notification = new NotificationEntity();
        notification.setSenderEmail(senderEmail);
        notification.setSenderNickname(senderNickname);
        notification.setReceiverEmail(receiverEmail);
        notification.setReceiverNickname(receiverNickname);
        notification.setNotificationName(notificationName);
        notification.setNotificationType(notificationType);
        notification.setNotificationStatus(false);
        notification.setNotificationContent(notificationContent);
        notification.setNotificationDate(LocalDateTime.now());

        notificationRepository.save(notification);
        sendNotification(notification);
    }

    // SSE 구독 (사용자별 구독 관리)
// (변경 없음: 구독 시 receiver의 이메일을 기준으로 구독)
    @Override
    public SseEmitter subscribe(String receiverEmail) {
        SseEmitter emitter = new SseEmitter(60 * 1000L); // 60초 후 자동 종료
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("SSE 연결 완료"));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }

    // SSE 실시간 알림 전송 (변경 없음)
    @Override
    public void sendNotification(NotificationEntity notification) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (IOException e) {
                emitter.completeWithError(e);
                emitters.remove(emitter);
            }
        }
    }

    /**
     * 읽지 않은 알림 조회 (receiver_email 기준)
     */
    @Override
    public List<NotificationEntity> getUnreadNotifications(String receiverEmail) {
        return notificationRepository.findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(receiverEmail);
    }

    /**
     * 알림 개별 읽음 처리
     */
    @Override
    public boolean markAsRead(Long notificationNumber) {
        return notificationRepository.findById(notificationNumber).map(notification -> {
            notification.setNotificationStatus(true);
            notificationRepository.save(notification);
            return true;
        }).orElse(false);
    }

    /**
     * 알림 전체 읽음 처리 (receiver_email 기준)
     */
    @Override
    public boolean markAllAsRead(String receiverEmail) {
        List<NotificationEntity> unreadNotifications = notificationRepository
                .findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(receiverEmail);

        if (unreadNotifications.isEmpty()) {
            return false;
        }

        unreadNotifications.forEach(notification -> notification.setNotificationStatus(true));
        notificationRepository.saveAll(unreadNotifications);
        return true;
    }

    /**
     * 알림 삭제
     */
    @Override
    public boolean deleteNotification(Long notificationNumber) {
        if (notificationRepository.existsById(notificationNumber)) {
            notificationRepository.deleteById(notificationNumber);
            return true;
        }
        return false;
    }
}

