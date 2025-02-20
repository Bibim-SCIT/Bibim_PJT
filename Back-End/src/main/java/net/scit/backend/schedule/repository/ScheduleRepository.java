package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.ScheduleEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long> {
    List<ScheduleEntity> findAllByWorkspace(WorkspaceEntity workspace);
}
