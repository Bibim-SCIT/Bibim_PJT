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

    //개별 태그 등록
    @Query("SELECT COUNT(t) FROM WorkDataFileTagEntity t WHERE t.workdataFileEntity.workdataEntity = :workdataEntity")
    int countByWorkdataFileEntity_WorkdataEntity(@Param("workdataEntity") WorkdataEntity workdataEntity);

    //개별 태그 삭제
        @Query("SELECT t FROM WorkDataFileTagEntity t WHERE t.tag = :tag AND t.workdataFileEntity.workdataEntity = :workdataEntity")
        Optional<WorkDataFileTagEntity> findByTagAndWorkdataFileEntity_WorkdataEntity(@Param("tag") String tag, @Param("workdataEntity") WorkdataEntity workdataEntity);



}
