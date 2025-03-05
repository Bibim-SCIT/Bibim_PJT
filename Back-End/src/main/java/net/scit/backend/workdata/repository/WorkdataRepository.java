package net.scit.backend.workdata.repository;

import io.lettuce.core.dynamic.annotation.Param;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkdataRepository extends JpaRepository<WorkdataEntity, Long> {

    // 전체 조회 (파일 및 태그 포함)
    @Query("SELECT DISTINCT w FROM WorkdataEntity w " +
            "LEFT JOIN FETCH w.workdataFile f " +
            "LEFT JOIN FETCH w.workdataFileTag t " +
            "LEFT JOIN w.workspaceMember wm " +
            "WHERE wm.workspace.wsId = :wsId")
    List<WorkdataEntity> findWithFilesAndTags(@Param("wsId") Long wsId);

    // 개별 게시물 조회
    @Query("SELECT w FROM WorkdataEntity w " +
            "LEFT JOIN FETCH w.workdataFile f " +
            "LEFT JOIN FETCH w.workdataFileTag t " +
            "LEFT JOIN w.workspaceMember wm " +
            "WHERE w.dataNumber = :dataNumber AND wm.workspace.wsId = :wsId")
    Optional<WorkdataEntity> findByDataNumberAndWorkspaceEntity_WsId(@Param("dataNumber") Long dataNumber, @Param("wsId") Long wsId);

    // 검색 기능 (writer, title, fileName, tag에서 검색)
    @Query("SELECT DISTINCT w FROM WorkdataEntity w " +
            "LEFT JOIN FETCH w.workdataFile f " +
            "LEFT JOIN FETCH w.workdataFileTag t " +
            "LEFT JOIN w.workspaceMember wm " +
            "WHERE wm.workspace.wsId = :wsId " +
            "AND (" +
            "LOWER(w.writer) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(w.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(f.fileName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.tag) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            ")")
    List<WorkdataEntity> searchByWorkspaceAndKeyword(@Param("wsId") Long wsId, @Param("keyword") String keyword);
}
