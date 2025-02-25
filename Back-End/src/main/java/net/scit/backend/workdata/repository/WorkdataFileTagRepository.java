package net.scit.backend.workdata.repository;

import io.lettuce.core.dynamic.annotation.Param;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WorkdataFileTagRepository extends JpaRepository<WorkDataFileTagEntity, Long> {

    //태그 등록
    @Query("SELECT COUNT(t) FROM WorkDataFileTagEntity t WHERE t.workdataFileEntity.workdataEntity = :workdataEntity")
    int countByWorkdataFileEntity_WorkdataEntity(@Param("workdataEntity") WorkdataEntity workdataEntity);

}
