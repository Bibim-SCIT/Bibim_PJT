package net.scit.backend.notification.repository;

import net.scit.backend.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    // 읽지 않은 알림을 최신순으로 조회
    List<NotificationEntity> findByMemberEmailAndNotificationStatusFalseOrderByNotificationDateDesc(String memberEmail);

}
