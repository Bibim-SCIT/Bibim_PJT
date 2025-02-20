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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkdataServiceImpl implements WorkdataService {

    private final WorkdataRepository workdataRepository;
    private final WorkdataFileRepository workdataFileRepository;
    private final WorkdataFileTagRepository workdataFileTagRepository;
    private final WorkspaceRepository workspaceRepository;

    /**
     * 1. 자료 전체 조회
     */
    @Override
    @Transactional
    public ResultDTO<List<WorkdataDTO>> workdata() {

        // 1⃣ 전체 자료 조회
        List<WorkdataEntity> workdataEntities = workdataRepository.findAll();

        // 2⃣ Entity -> DTO 변환
        List<WorkdataDTO> workdataDTOs = workdataEntities.stream()
                .map(WorkdataDTO::toDTO)
                .toList();

        log.info("조회된 자료 수: {}", workdataDTOs.size());

        // 3⃣ 결과 반환
        return ResultDTO.of("자료 전체 조회에 성공했습니다.", workdataDTOs);
    }

    //2. 자료글 등록
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workdataCreate(Long wsId, WorkdataDTO workdataDTO) {
        log.info("workdataDTO: {}", workdataDTO);
        log.info("wsId: {}", wsId);

        // wsId 검증
        if (wsId == null) {
            throw new IllegalArgumentException("워크스페이스 ID가 null입니다.");
        }

        // 워크스페이스 존재 여부 확인
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 워크스페이스가 존재하지 않습니다. ID: " + wsId));

        // 새로운 데이터 생성 시 ID가 없어야 함
        if (workdataDTO.getDataNumber() != null) {
            throw new IllegalArgumentException("새로운 자료글을 생성할 때는 ID를 제공하지 않아야 합니다.");
        }

        // DTO를 엔티티로 변환
        WorkdataEntity workdataEntity = WorkdataEntity.toEntity(workdataDTO, workspaceEntity);
        if (workdataEntity == null) {
            throw new IllegalStateException("WorkdataEntity 변환 중 문제가 발생했습니다.");
        }

        log.info("workdataEntity: {}", workdataEntity);

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
