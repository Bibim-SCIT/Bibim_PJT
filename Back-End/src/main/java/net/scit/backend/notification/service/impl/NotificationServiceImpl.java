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
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();


//    @Override
//    public void createNotification(String senderEmail, String senderNickname,
//                                   String receiverEmail, String receiverNickname,
//                                   Long workspaceId, Long scheduleNumber, Long recordNumber, Long workdataNumber,
//                                   String notificationName, String notificationType, String notificationContent) {
//        NotificationEntity notification = new NotificationEntity();
//        notification.setSenderEmail(senderEmail);
//        notification.setSenderNickname(senderNickname);
//        notification.setReceiverEmail(receiverEmail);
//        notification.setReceiverNickname(receiverNickname);
//        notification.setWsId(workspaceId);  // workspaceId 설정
//        notification.setNotificationName(notificationName);
//        notification.setNotificationType(notificationType);
//        notification.setNotificationContent(notificationContent);
//        notification.setNotificationStatus(false);
//        notification.setNotificationDate(LocalDateTime.now());
//
//        // 변경: saveAndFlush() 사용하여 즉시 DB에 반영 및 자동 생성된 notificationNumber 확인
//        notificationRepository.saveAndFlush(notification); // 변경된 부분
//        log.info("Notification created with ID: {}", notification.getNotificationNumber()); // 변경 로그
//
//        sendNotification(notification);
//    }

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


    @Override
    public String getNotificationUrl(Long notificationId) {
        // 현재 로그인한 사용자 이메일 가져오기
        String currentUserEmail = AuthUtil.getLoginUserId();

        // 알림 조회
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // 🛑 알림을 받을 권한이 있는지 확인 (알림 수신자와 현재 로그인한 사용자 비교)
        if (!notification.getReceiverEmail().equals(currentUserEmail)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 🛑 URL이 null이거나 빈 문자열인 경우 예외 처리
        String notificationUrl = notification.getNotificationUrl();
        if (notificationUrl == null || notificationUrl.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_NOTIFICATION_URL);
        }

        // ✅ 정상적인 경우 알림 URL 반환
        return notificationUrl;
    }

}
