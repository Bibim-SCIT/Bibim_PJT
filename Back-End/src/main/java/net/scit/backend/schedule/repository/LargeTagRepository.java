package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.LargeTagEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LargeTagRepository extends JpaRepository<LargeTagEntity, Long> {
    Optional<LargeTagEntity> findByTagName(String largeTagName);

    List<LargeTagEntity> findAllByWorkspace(WorkspaceEntity workspace);
}
