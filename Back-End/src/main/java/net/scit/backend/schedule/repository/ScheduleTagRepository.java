package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.ScheduleTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScheduleTagRepository extends JpaRepository<ScheduleTagEntity, Long> {
//    Optional<ScheduleTagEntity> findBySchedule(ScheduleEntity scheduleEntity);

    Optional<ScheduleTagEntity> findByScheduleTagNumber(Long scheduleTag);

//    @Query("SELECT st FROM ScheduleTagEntity st " +
//            "JOIN FETCH st.largeTag lt " +
//            "JOIN FETCH st.mediumTag mt " +
//            "JOIN FETCH st.smallTag stt " +
//            "WHERE st.schedule = :scheduleEntity")
//    Optional<ScheduleTagEntity> findBySchedule(@Param("scheduleEntity") ScheduleEntity scheduleEntity);

//    @Query("SELECT st FROM ScheduleTagEntity st WHERE st.schedule IN :schedules")
//    List<ScheduleTagEntity> findBySchedules(List<ScheduleEntity> schedules);
}
