package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.ScheduleTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduleTagRepository extends JpaRepository<ScheduleTagEntity, Long> {
}
