package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkdataFileRepository extends JpaRepository<WorkdataFileEntity, Long> {

    Optional<Object> findByWorkdataEntityAndFileNumber(WorkdataEntity workdataEntity, Long fileNumber);

    //파일 개수 계산
    int countByWorkdataEntity(WorkdataEntity workdataEntity);

    //태그 등록
    WorkdataFileEntity findFirstByWorkdataEntity(WorkdataEntity workdataEntity);

}
