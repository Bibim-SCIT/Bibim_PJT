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

    
    /**
     * SSE 구독 (로그인 시 호출)
     * - 예: 24시간(24 * 60 * 60 * 1000L) 동안 연결 유지
     */
    @Override
    public SseEmitter subscribe(String receiverEmail) {
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L);  // 24시간
        emitters.put(receiverEmail, emitter);

        emitter.onCompletion(() -> emitters.remove(receiverEmail));
        emitter.onTimeout(() -> emitters.remove(receiverEmail));
        emitter.onError(e -> emitters.remove(receiverEmail));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("SSE 연결 완료"));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
        return emitter;
    }

    
    /**
     * SSE 구독 해제 (로그아웃 시 호출)
     */
    @Override
    public void unsubscribe(String receiverEmail) {
        SseEmitter emitter = emitters.remove(receiverEmail);
        if (emitter != null) {
            emitter.complete();
        }
    }


    /**
     * 알림 생성 & 전송
     * @param notification
     * @return
     */
    @Transactional
    @Override
    public NotificationResponseDTO createAndSendNotification(NotificationEntity notification) {
        // 즉시 DB에 반영하여 자동 생성된 ID를 확인
        NotificationEntity savedNotification = notificationRepository.saveAndFlush(notification);
        log.info("Notification created with ID: {}", savedNotification.getNotificationNumber());

        // 알림 전송
        sendNotification(savedNotification);

        // DTO 변환 후 반환
        return convertToResponseDTO(savedNotification);
    }
    /**
     * ResponseDTO로 변환
     * @param notification
     * @return
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
                notification.getNotificationUrl()  // URL 포함 (필요 시)
        );
    }

    /**
     * 알림 전송
     * @param notification
     * @return
     */
    @Override
    public NotificationEntity sendNotification(NotificationEntity notification) {
        // Map의 entrySet을 순회하여 각 SseEmitter에 알림 전송
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            String key = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (IOException e) {
                emitter.completeWithError(e);
                emitters.remove(key);
            }
        }
        return notification;
    }

    /**
     * 안 읽은 알림 전체 조회
     * @param receiverEmail
     * @return
     */
    @Override
    public List<NotificationEntity> getUnreadNotifications(String receiverEmail) {
        return notificationRepository.findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(receiverEmail);
    }

    /**
     * 개별 알림 읽음
     * @param notificationNumber
     * @return
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
     * 알림 전체 읽음
     * @param receiverEmail
     * @return
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
     * @param notificationNumber
     * @return
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
     * 알림 url 접속
     * @param notificationId
     * @return
     */
    @Override
    public String getNotificationUrl(Long notificationId) {
        // 현재 로그인한 사용자 이메일 가져오기
        String currentUserEmail = AuthUtil.getLoginUserId();

        // 알림 조회
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // 알림을 받을 권한이 있는지 확인 (알림 수신자와 현재 로그인한 사용자 비교)
        if (!notification.getReceiverEmail().equals(currentUserEmail)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // URL이 null이거나 빈 문자열인 경우 예외 처리
        String notificationUrl = notification.getNotificationUrl();
        if (notificationUrl == null || notificationUrl.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_NOTIFICATION_URL);
        }

        log.info("notificationUrl : {}", notificationUrl);
        return notificationUrl;
    }
}
