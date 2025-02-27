package net.scit.backend.workdata.repository;

import io.lettuce.core.dynamic.annotation.Param;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkdataRepository extends JpaRepository<WorkdataEntity, Long> {

    //전체 조회
    @Query("SELECT w FROM WorkdataEntity w " +
            "LEFT JOIN FETCH w.workdataFile f " +
            "LEFT JOIN FETCH f.workdataFileTag t " +
            "WHERE w.workspaceEntity.wsId = :wsId")
    List<WorkdataEntity> findWithFilesAndTags(@Param("wsId") Long wsId);

    //개별 게시물 조회
    Optional<WorkdataEntity> findByDataNumberAndWorkspaceEntity_WsId(Long dataNumber, Long wsId);

    //검색 기능
    @Query("SELECT DISTINCT w FROM WorkdataEntity w " +
            "LEFT JOIN w.workdataFile f " +
            "LEFT JOIN f.workdataFileTag t " +
            "WHERE w.workspaceEntity.wsId = :wsId " +
            "AND (LOWER(w.writer) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(w.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(f.fileName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.tag) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<WorkdataEntity> searchByWorkspaceAndKeyword(@Param("wsId") Long wsId, @Param("keyword") String keyword);

    //태그 등록
    Optional<WorkdataEntity> findByDataNumberAndWorkspaceEntity(Long dataNumber, WorkspaceEntity workspaceEntity);
}
