package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkdataFileRepository extends JpaRepository<WorkdataFileEntity, Long> {

    List<WorkdataFileEntity> findByFileNameInAndWorkdataEntity(List<String> fileNames, WorkdataEntity workdataEntity);

    List<WorkdataFileEntity> findByWorkdataEntity(WorkdataEntity workdataEntity);
}

