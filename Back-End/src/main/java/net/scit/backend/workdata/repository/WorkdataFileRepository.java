package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface WorkdataFileRepository extends JpaRepository<WorkdataFileEntity, Long> {

    //파일 개수 계산
    int countByWorkdataEntity(WorkdataEntity workdataEntity);

    //1-3) 태그 수정
    // 파일명 목록에 해당하는 파일들을 자료글과 함께 조회
    List<WorkdataFileEntity> findByFileNameInAndWorkdataEntity(List<String> fileNames, WorkdataEntity workdataEntity);
    List<WorkdataFileEntity> findByWorkdataEntity(WorkdataEntity workdataEntity);
}

