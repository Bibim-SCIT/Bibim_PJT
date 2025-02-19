package net.scit.backend.workdata.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.repository.WorkdataFileRepository;
import net.scit.backend.workdata.repository.WorkdataFileTagRepository;
import net.scit.backend.workdata.repository.WorkdataRepository;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkdataServiceImpl implements WorkdataService {

    private final WorkdataRepository workdataRepository;
    private final WorkdataFileRepository workdataFileRepository;
    private final WorkdataFileTagRepository workdataFileTagRepository;
    private final WorkspaceRepository workspaceRepository;

    //자료글 등록
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workdataCreate(WorkdataDTO workdataDTO, Long wsId){
        log.info("workdataDTO:{}", workdataDTO);
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId).get();
        // DTO를 엔티티로 변환
        WorkdataEntity workdataEntity = WorkdataEntity.toEntity(workdataDTO, workspaceEntity);
        log.info("workdataEntity:{}", workdataEntity);

        // 엔티티 저장 (DB에 저장)
        workdataEntity = workdataRepository.save(workdataEntity);

        // 성공 여부를 담은 DTO 생성
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("자료글 생성에 성공했습니다.", successDTO);
    }
}
