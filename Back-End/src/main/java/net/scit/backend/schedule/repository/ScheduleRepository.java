package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.ScheduleEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long> {
    List<ScheduleEntity> findAllByWorkspace(WorkspaceEntity workspace);

    Optional<ScheduleEntity> findByScheduleNumber(Long scheduleNumber);
}
