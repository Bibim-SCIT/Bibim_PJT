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


    // ✅ 알림 생성
    @Override
    public void createNotification(String memberEmail, Long workspaceId, Long scheduleNumber, Long recordNumber, Long workdataNumber,
                                   String notificationName, String notificationType, String notificationContent) {
        NotificationEntity notification = new NotificationEntity();
        notification.setMemberEmail(memberEmail);
        notification.setWorkspaceId(workspaceId);
        notification.setScheduleNumber(scheduleNumber);
        notification.setRecordNumber(recordNumber);
        notification.setWorkdataNumber(workdataNumber);
        notification.setNotificationName(notificationName);
        notification.setNotificationType(notificationType);
        notification.setNotificationStatus(false);
        notification.setNotificationContent(notificationContent);
        notification.setNotificationDate(LocalDateTime.now());

        notificationRepository.save(notification);
        sendNotification(notification);
    }

    // ✅ SSE 구독 (사용자별)
    @Override
    public SseEmitter subscribe(String memberEmail) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Subscribed successfully"));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }


    // ✅ 알림을 SSE로 전송
    private void sendNotification(NotificationEntity notification) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (IOException e) {
                emitter.completeWithError(e);
                emitters.remove(emitter);
            }
        }
    }


    // ✅ 읽지 않은 알림 조회
    @Override
    public List<NotificationEntity> getUnreadNotifications(String memberEmail) {
        return notificationRepository.findByMemberEmailAndNotificationStatusFalseOrderByNotificationDateDesc(memberEmail);
    }


    // ✅ 알림 읽음 처리
    @Override
    public boolean markAsRead(Long notificationNumber) {
        return notificationRepository.findById(notificationNumber).map(notification -> {
            notification.setNotificationStatus(true);
            notificationRepository.save(notification);
            return true;
        }).orElse(false);
    }


    // ✅ 알림 삭제
    @Override
    public boolean deleteNotification(Long notificationNumber) {
        if (notificationRepository.existsById(notificationNumber)) {
            notificationRepository.deleteById(notificationNumber);
            return true;
        }
        return false;
    }
}
