package net.scit.backend.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.notification.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationCleanupService {

    private final NotificationRepository notificationRepository;

    /**
     * 매주 일요일 자정(00:00)에 7일 지난 읽은 알림 삭제
     */
    @Scheduled(cron = "0 0 0 * * SUN")  // 매주 일요일 00:00 실행
    @Transactional
    public void cleanOldNotifications() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        int deletedCount = notificationRepository.deleteOldReadNotifications(oneWeekAgo);
        log.info("✅ {}개의 7일 지난 읽은 알림이 삭제되었습니다.", deletedCount);
    }
}
