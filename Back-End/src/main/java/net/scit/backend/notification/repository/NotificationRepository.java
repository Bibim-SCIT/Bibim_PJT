package net.scit.backend.notification.repository;

import net.scit.backend.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    // 읽지 않은 알림을 최신순으로 페이징 조회
    List<NotificationEntity> findByReceiverEmailAndNotificationStatusFalseOrderByNotificationDateDesc(String receiverEmail);

    // 읽은 알림을 최신순으로 페이징 조회
    List<NotificationEntity> findByReceiverEmailAndNotificationStatusTrueOrderByNotificationDateDesc(String receiverEmail);


    // Bulk update: 해당 사용자의 모든 unread 알림을 한 번의 쿼리로 읽음 처리
    @Modifying
    @Query("UPDATE NotificationEntity n SET n.notificationStatus = true WHERE n.receiverEmail = :receiverEmail AND n.notificationStatus = false")
    int bulkMarkAllAsRead(@Param("receiverEmail") String receiverEmail);
}
