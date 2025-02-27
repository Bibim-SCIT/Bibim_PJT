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

    //1-3)태그 수정
    // 해당 자료글에 속한 모든 태그 조회
    List<WorkDataFileTagEntity> findByWorkdataFileEntity_WorkdataEntity(WorkdataEntity workdataEntity);

    // 태그명 목록에 해당하는 태그들을 자료글과 함께 조회
    List<WorkDataFileTagEntity> findByTagInAndWorkdataFileEntity_WorkdataEntity(List<String> tags, WorkdataEntity workdataEntity);

    // 개별 태그 조회 (태그명과 자료글을 기준으로 조회)
    Optional<WorkDataFileTagEntity> findByTagAndWorkdataFileEntity_WorkdataEntity(String tag, WorkdataEntity workdataEntity);

}
