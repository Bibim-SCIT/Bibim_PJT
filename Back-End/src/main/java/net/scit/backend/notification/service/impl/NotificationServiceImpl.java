package net.scit.backend.notification.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.notification.dto.NotificationResponseDTO;
import net.scit.backend.notification.entity.NotificationEntity;
import net.scit.backend.notification.repository.NotificationRepository;
import net.scit.backend.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    // 사용자 이메일을 키로, SseEmitter를 값으로 가지는 맵
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    @Override
    public SseEmitter subscribe(String email) {
        // SSE 연결 유지 시간을 10분(600,000ms)으로 설정
        SseEmitter emitter = new SseEmitter(600_000L);

        // 🔹 기존 연결이 있다면 제거 후 새 연결 추가
        removeEmitter(email);
        emitters.put(email, emitter);

        // 🔹 클라이언트가 연결을 닫거나 타임아웃 시 Emitter 제거
        emitter.onCompletion(() -> removeEmitter(email));
        emitter.onTimeout(() -> removeEmitter(email));

        return emitter;
    }

//    // 🔹 SSE Emitter 추가 (addEmitter)
//    @Override
//    public void addEmitter(String email, SseEmitter emitter) {
//        emitters.put(email, emitter);
//        log.info("✅ SSE Emitter 등록 완료: {}", email);
//    }

    @Override
    public void removeEmitter(String email) {
        SseEmitter emitter = emitters.remove(email);
        if (emitter != null) {
            emitter.complete();
        }
    }

    @Override
    public void unsubscribe(String receiverEmail) {
        SseEmitter emitter = emitters.remove(receiverEmail);
        if (emitter != null) {
            emitter.complete();
        }
    }

    @Transactional
    @Override
    public NotificationResponseDTO createAndSendNotification(NotificationEntity notification) {
        NotificationEntity savedNotification = notificationRepository.saveAndFlush(notification);
        log.info("Notification created with ID: {}", savedNotification.getNotificationNumber());
        sendNotification(savedNotification);
        return convertToResponseDTO(savedNotification);
    }

    private NotificationResponseDTO convertToResponseDTO(NotificationEntity notification) {
        return new NotificationResponseDTO(
                notification.getNotificationNumber(),
                notification.getWsId(),
                notification.getSenderEmail(),
                notification.getSenderNickname(),
                notification.getReceiverEmail(),
                notification.getReceiverNickname(),
                notification.getNotificationName(),
                notification.getNotificationType(),
                notification.getNotificationContent(),
                notification.getNotificationUrl()
        );
    }

    @Override
    public NotificationEntity sendNotification(NotificationEntity notification) {
        String receiverEmail = notification.getReceiverEmail();  // 알림의 수신자 이메일
        SseEmitter emitter = emitters.get(receiverEmail);         // 해당 이메일에 등록된 emitter 가져오기

        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
                log.info("✅ 알림 전송 완료: {} -> {}", notification.getNotificationName(), receiverEmail);
            } catch (IOException e) {
                emitter.completeWithError(e);
                emitters.remove(receiverEmail);
                log.error("❌ SSE 알림 전송 실패: {}", e.getMessage());
            }
        } else {
            log.warn("⚠️ 해당 사용자 SSE 연결 없음: {}", receiverEmail);
        }
        return notification;
    }


    @Override
    public List<NotificationEntity> getUnreadNotifications(String receiverEmail) {
        List<NotificationEntity> result = notificationRepository.findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(receiverEmail);
        log.info("✅ [백엔드] 조회된 알림 개수: {}", result.size());
        return result;
    }


    @Override
    public List<NotificationEntity> getReadNotifications(String receiverEmail) {
        List<NotificationEntity> result = notificationRepository
                .findByReceiverEmailAndNotificationStatusTrueOrderByNotificationDateDesc(receiverEmail);
        log.info("✅ [백엔드] 조회된 읽은 알림 개수: {}", result.size());
        return result;
    }


    @Override
    public boolean markAsRead(Long notificationNumber) {
        return notificationRepository.findById(notificationNumber).map(notification -> {
            notification.setNotificationStatus(true);
            notificationRepository.save(notification);
            return true;
        }).orElse(false);
    }

    @Transactional
    @Override
    public boolean markAllAsRead(String receiverEmail) {
        int updatedCount = notificationRepository.bulkMarkAllAsRead(receiverEmail);
        return updatedCount > 0;
    }

    @Override
    public boolean deleteNotification(Long notificationNumber) {
        if (notificationRepository.existsById(notificationNumber)) {
            notificationRepository.deleteById(notificationNumber);
            return true;
        }
        return false;
    }


    @Transactional
    @Override
    public boolean deleteAllRead(String receiverEmail) {
        List<NotificationEntity> readNotifications =
                notificationRepository.findByReceiverEmailAndNotificationStatusTrueOrderByNotificationDateDesc(receiverEmail);
        if (readNotifications.isEmpty()) {
            return false;
        }
        notificationRepository.deleteAll(readNotifications);
        log.info("읽은 알림 전체 삭제 완료, 삭제 개수: {}", readNotifications.size());
        return true;
    }

    @Transactional
    @Override
    public boolean deleteAllUnread(String receiverEmail) {
        List<NotificationEntity> unreadNotifications =
                notificationRepository.findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(receiverEmail);
        if (unreadNotifications.isEmpty()) {
            return false;
        }
        notificationRepository.deleteAll(unreadNotifications);
        log.info("안 읽은 알림 전체 삭제 완료, 삭제 개수: {}", unreadNotifications.size());
        return true;
    }


    @Override
    public String getNotificationUrl(Long notificationId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));

        String notificationUrl = notification.getNotificationUrl();
        if (notificationUrl == null || notificationUrl.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_NOTIFICATION_URL);
        }
        log.info("notificationUrl : {}", notificationUrl);
        return notificationUrl;
    }
}
