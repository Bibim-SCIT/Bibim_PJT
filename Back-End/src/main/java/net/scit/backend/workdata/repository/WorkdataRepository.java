package net.scit.backend.workdata.repository;

import io.lettuce.core.dynamic.annotation.Param;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkdataRepository extends JpaRepository<WorkdataEntity, Long> {

    //전체 조회
    List<WorkdataEntity> findByWorkspaceEntity_WsId(Long wsId);

    //검색 기능
    @Query("SELECT DISTINCT w FROM WorkdataEntity w " +
            "LEFT JOIN w.workdataFile wf " +
            "WHERE w.workspaceEntity.wsId = :wsId " +
            "AND (w.writer LIKE %:keyword% " +
            "OR w.title LIKE %:keyword% " +
            "OR wf.fileName LIKE %:keyword%)")
    List<WorkdataEntity> searchByWorkspaceAndKeyword(@Param("wsId") Long wsId,
                                                     @Param("keyword") String keyword);

    //정렬 기능
    // WorkdataRepository.java
    List<WorkdataEntity> findByWorkspaceEntity_WsId(Long wsId, Sort sort);

    //태그 등록
    Optional<WorkdataEntity> findByDataNumberAndWorkspaceEntity(Long dataNumber, WorkspaceEntity workspaceEntity);
}
