package net.scit.backend.workdata.repository;

import io.lettuce.core.dynamic.annotation.Param;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkdataRepository extends JpaRepository<WorkdataEntity, Long> {

    // 전체 조회 (파일 및 태그 포함)
    @Query("""
        SELECT DISTINCT w
        FROM WorkdataEntity w
        LEFT JOIN FETCH w.workdataFiles
        LEFT JOIN FETCH w.workdataFileTags
        WHERE w.workspace.wsId = :wsId
        """)
    List<WorkdataEntity> findWithFilesAndTags(@Param("wsId") Long wsId);

    // 개별 게시물 조회
    @Query("""
        SELECT w 
        FROM WorkdataEntity w
        LEFT JOIN FETCH w.workdataFiles
        LEFT JOIN FETCH w.workdataFileTags
        WHERE w.dataNumber = :dataNumber
          AND w.workspace.wsId = :wsId
        """)
    Optional<WorkdataEntity> findByDataNumberAndWorkspace_WsId(@Param("dataNumber") Long dataNumber,
                                                               @Param("wsId") Long wsId);

    // 검색 기능 (writer, title, fileName, tag에서 검색)
    // keyword가 writer, title, fileName, tag에 포함된 자료글 검색
    @Query("""
        SELECT DISTINCT w
        FROM WorkdataEntity w
        LEFT JOIN w.workdataFiles f
        LEFT JOIN w.workdataFileTags t
        WHERE w.workspace.wsId = :wsId
          AND (
               LOWER(w.writer) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(w.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(f.fileName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(t.tag) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        """)
    List<WorkdataEntity> searchByWorkspaceAndKeyword(@Param("wsId") Long wsId,
                                                     @Param("keyword") String keyword);

}
