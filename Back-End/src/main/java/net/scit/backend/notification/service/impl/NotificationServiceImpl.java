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
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

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
        notification.setWsId(workspaceId);  // ✅ 수정됨: workspaceId를 설정
        notification.setNotificationName(notificationName);
        notification.setNotificationType(notificationType);
        notification.setNotificationContent(notificationContent);
        notification.setNotificationStatus(false);
        notification.setNotificationDate(LocalDateTime.now());

        notificationRepository.save(notification);
        sendNotification(notification);
    }

    @Override
    public SseEmitter subscribe(String receiverEmail) {
        SseEmitter emitter = new SseEmitter(60 * 1000L);
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

    @Override
    public List<NotificationEntity> getUnreadNotifications(String receiverEmail) {
        return notificationRepository.findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(receiverEmail);
    }

    @Override
    public boolean markAsRead(Long notificationNumber) {
        return notificationRepository.findById(notificationNumber).map(notification -> {
            notification.setNotificationStatus(true);
            notificationRepository.save(notification);
            return true;
        }).orElse(false);
    }

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

    @Override
    public boolean deleteNotification(Long notificationNumber) {
        if (notificationRepository.existsById(notificationNumber)) {
            notificationRepository.deleteById(notificationNumber);
            return true;
        }
        return false;
    }
}
