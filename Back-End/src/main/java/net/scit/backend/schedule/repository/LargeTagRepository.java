package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.LargeTagEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LargeTagRepository extends JpaRepository<LargeTagEntity, Long> {
    Optional<LargeTagEntity> findByTagName(String largeTagName);

    List<LargeTagEntity> findAllByWorkspace(WorkspaceEntity workspace);

    @Query("SELECT l, m, s " +
            "FROM LargeTagEntity l " +
            "LEFT JOIN MediumTagEntity m ON m.largeTag = l " +
            "LEFT JOIN SmallTagEntity s ON s.mediumTag = m " +
            "WHERE l.workspace.wsId = :wsId")
    List<Object[]> findAllTagsByWorkspace(@Param("wsId") Long wsId);
}
