package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkdataFileRepository extends JpaRepository<WorkdataFileEntity, Long> {

    Optional<WorkdataFileEntity> findByWorkdataEntityAndFileName(WorkdataEntity workdataEntity, String fileName);
}
