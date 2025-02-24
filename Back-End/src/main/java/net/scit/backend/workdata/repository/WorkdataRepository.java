package net.scit.backend.workdata.repository;

import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkdataRepository extends JpaRepository<WorkdataEntity, Long> {

    //전체 조회 시 사용
    List<WorkdataEntity> findByWorkspaceEntity_WsId(Long wsId);

}
