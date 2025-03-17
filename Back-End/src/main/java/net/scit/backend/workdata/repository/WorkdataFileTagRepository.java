package net.scit.backend.workdata.repository;

import io.lettuce.core.dynamic.annotation.Param;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface WorkdataFileTagRepository extends JpaRepository<WorkDataFileTagEntity, Long> {

    // 해당 자료글에 속한 모든 태그 조회
    List<WorkDataFileTagEntity> findByWorkdataEntity(WorkdataEntity workdataEntity);

    // 태그명 목록에 해당하는 태그들을 자료글과 함께 조회
    List<WorkDataFileTagEntity> findByTagInAndWorkdataEntity(List<String> deleteTags, WorkdataEntity workdataEntity);

    @Query("""
        SELECT DISTINCT t.tag
        FROM WorkDataFileTagEntity t
        JOIN t.workdataEntity w
        WHERE w.workspace.wsId = :wsId
    """)
    List<String> findAllTagsByWorkspace(@Param("wsId") Long wsId);
}
