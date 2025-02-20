package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkdataFileTagRepository extends JpaRepository<WorkDataFileTagEntity, Long> {

}
