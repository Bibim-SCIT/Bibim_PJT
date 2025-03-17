package net.scit.backend.notification.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
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
    // 동시성 처리를 위해 ConcurrentHashMap 사용하여 SseEmitter 관리
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    /**
     * 사용자의 SSE 구독 처리
     *
     * @param email 사용자 이메일
     * @return SseEmitter 객체
     */
    @Override
    public SseEmitter subscribe(String email) {
        SseEmitter emitter = new SseEmitter(600_000L); // 10분 유지
        removeEmitter(email); // 기존 연결 제거
        emitters.put(email, emitter); // 새로운 연결 추가

        emitter.onCompletion(() -> removeEmitter(email));
        emitter.onTimeout(() -> removeEmitter(email));

        return emitter;
    }

    /**
     * 사용자의 Emitter 제거 및 연결 종료
     *
     * @param email 사용자 이메일
     */
    @Override
    public void removeEmitter(String email) {
        SseEmitter emitter = emitters.remove(email);
        if (emitter != null) {
            emitter.complete();
        }
    }

    /**
     * 사용자의 SSE 구독 해제
     *
     * @param receiverEmail 수신자 이메일
     */
    @Override
    public void unsubscribe(String receiverEmail) {
        removeEmitter(receiverEmail);
    }

    /**
     * 알림 생성 및 전송
     *
     * @param notification 생성할 알림 엔티티
     * @return 생성된 알림 DTO
     */
    @Transactional
    @Override
    public NotificationResponseDTO createAndSendNotification(NotificationEntity notification) {
        NotificationEntity savedNotification = notificationRepository.saveAndFlush(notification);
        log.info("Notification created with ID: {}", savedNotification.getNotificationNumber());
        sendNotification(savedNotification);
        return convertToResponseDTO(savedNotification);
    }

    /**
     * 알림 엔티티를 DTO로 변환
     */
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

    /**
     * 알림 전송 처리
     */
    @Override
    public NotificationEntity sendNotification(NotificationEntity notification) {
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().name("notification").data(notification));
            } catch (IOException e) {
                entry.getValue().completeWithError(e);
                emitters.remove(entry.getKey());
            }
        }
        return notification;
    }

    /**
     * 읽지 않은 알림 조회
     */
    @Override
    public List<NotificationEntity> getUnreadNotifications(String receiverEmail) {
        List<NotificationEntity> result = notificationRepository.findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(receiverEmail);
        log.info("✅ [백엔드] 조회된 알림 개수: {}", result.size());
        return result;
    }

    /**
     * 읽은 알림 조회
     */
    @Override
    public List<NotificationEntity> getReadNotifications(String receiverEmail) {
        List<NotificationEntity> result = notificationRepository
                .findByReceiverEmailAndNotificationStatusTrueOrderByNotificationDateDesc(receiverEmail);
        log.info("✅ [백엔드] 조회된 읽은 알림 개수: {}", result.size());
        return result;
    }

    /**
     * 단일 알림 읽음 처리
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
     * 모든 알림 읽음 처리
     */
    @Transactional
    @Override
    public boolean markAllAsRead(String receiverEmail) {
        int updatedCount = notificationRepository.bulkMarkAllAsRead(receiverEmail);
        return updatedCount > 0;
    }

    /**
     * 알림 삭제 처리
     */
    @Override
    public boolean deleteNotification(Long notificationNumber) {
        if (notificationRepository.existsById(notificationNumber)) {
            notificationRepository.deleteById(notificationNumber);
            return true;
        }
        return false;
    }

    /**
     * 알림 URL 조회 및 검증
     */
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
