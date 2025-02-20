package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkdataRepository extends JpaRepository<WorkdataEntity, Long> {

}
