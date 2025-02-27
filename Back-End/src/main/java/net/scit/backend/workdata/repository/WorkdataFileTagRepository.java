package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkdataFileTagRepository extends JpaRepository<WorkDataFileTagEntity, Long> {

    //1-3)태그 수정
    // 해당 자료글에 속한 모든 태그 조회
    List<WorkDataFileTagEntity> findByWorkdataEntity(WorkdataEntity workdataEntity);

    // 태그명 목록에 해당하는 태그들을 자료글과 함께 조회
    List<WorkDataFileTagEntity> findByTagInAndWorkdataEntity(List<String> deleteTags, WorkdataEntity workdataEntity);

    // 개별 태그 조회 (태그명과 자료글을 기준으로 조회)
    Optional<WorkDataFileTagEntity> findByTagAndWorkdataEntity(String tag, WorkdataEntity workdataEntity);


}
