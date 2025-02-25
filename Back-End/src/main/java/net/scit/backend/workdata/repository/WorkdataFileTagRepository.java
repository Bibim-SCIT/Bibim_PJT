package net.scit.backend.workdata.repository;

import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkdataFileTagRepository extends JpaRepository<WorkDataFileTagEntity, Long> {

    //태그 삭제 시 관련 태그 모두 조회
    List<WorkDataFileTagEntity> findByWorkdataFileEntity(WorkdataFileEntity workdataFileEntity);

    /**
     * 특정 자료글(WorkdataEntity)에 연결된 모든 태그 삭제
     * - 해당 자료글의 모든 파일(WorkdataFileEntity)을 조회한 후
     * - 그 파일들에 연결된 태그(WorkDataFileTagEntity)를 삭제
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM WorkDataFileTagEntity t WHERE t.workdataFileEntity IN " +
            "(SELECT f FROM WorkdataFileEntity f WHERE f.workdataEntity = :workdataEntity)")
    void deleteByWorkdataFileEntity_WorkdataEntity(@Param("workdataEntity") WorkdataEntity workdataEntity);

    //개별 태그 등록
    @Query("SELECT COUNT(t) FROM WorkDataFileTagEntity t WHERE t.workdataFileEntity.workdataEntity = :workdataEntity")
    int countByWorkdataFileEntity_WorkdataEntity(@Param("workdataEntity") WorkdataEntity workdataEntity);

    //개별 태그 삭제
        @Query("SELECT t FROM WorkDataFileTagEntity t WHERE t.tag = :tag AND t.workdataFileEntity.workdataEntity = :workdataEntity")
        Optional<WorkDataFileTagEntity> findByTagAndWorkdataFileEntity_WorkdataEntity(@Param("tag") String tag, @Param("workdataEntity") WorkdataEntity workdataEntity);



}
