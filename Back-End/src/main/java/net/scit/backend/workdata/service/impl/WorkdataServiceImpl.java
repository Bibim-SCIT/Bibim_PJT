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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkdataServiceImpl implements WorkdataService {

    private final WorkdataRepository workdataRepository;
    private final WorkdataFileRepository workdataFileRepository;
    private final WorkdataFileTagRepository workdataFileTagRepository;
    private final WorkspaceRepository workspaceRepository;

    /**
     * 1. 자료글 전체 조회
     * @return
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


    /**
     *  2. 자료글 등록
     * @param wsId
     * @param workdataDTO
     * @return
     */
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


    /**
     * 3. 자료글 삭제
     * @param wsId
     * @param workdataDTO
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workdataDelete(Long wsId, WorkdataDTO workdataDTO) {
        log.info("workdataDTO: {}", workdataDTO);
        log.info("wsId: {}", wsId);

        // 자료글 존재 여부 확인
        Optional<WorkdataEntity> workdataEntityOpt = workdataRepository.findById(workdataDTO.getDataNumber());

        if (workdataEntityOpt.isEmpty()) {
            log.warn("자료글이 존재하지 않습니다. dataNumber: {}", workdataDTO.getDataNumber());
            // 실패 시 success: false
            SuccessDTO failDTO = SuccessDTO.builder()
                    .success(false)
                    .build();
            return ResultDTO.of("자료글이 존재하지 않습니다.", failDTO);
        }

        WorkdataEntity workdataEntity = workdataEntityOpt.get();

        // 워크스페이스 ID 검증
        if (!workdataEntity.getWorkspaceEntity().getWsId().equals(wsId)) {
            log.warn("워크스페이스 ID가 일치하지 않습니다. 요청 wsId: {}, 자료글 wsId: {}", wsId, workdataEntity.getWorkspaceEntity().getWsId());

            // 실패 시 success: false
            SuccessDTO failDTO = SuccessDTO.builder()
                    .success(false)
                    .build();
            return ResultDTO.of("워크스페이스 ID가 일치하지 않습니다.", failDTO);
        }

        //자료글 삭제
        workdataRepository.delete(workdataEntity);
        log.info("자료글 삭제 완료. dataNumber: {}", workdataDTO.getDataNumber());
        // 성공 여부 반환
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("자료글 삭제에 성공했습니다.", successDTO);
    }

    /**
     * 4. 자료글 수정
     * @param wsId
     * @param workdataDTO
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<WorkdataDTO> workdataUpdate(Long wsId, WorkdataDTO workdataDTO) {
        // 수정할 자료글 조회
        WorkdataEntity workdataEntity = workdataRepository.findById(workdataDTO.getDataNumber())
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 수정할 데이터 변경
        workdataEntity.setTitle(workdataDTO.getTitle());
        workdataEntity.setContent(workdataDTO.getContent());

        // 수정된 시간으로 regDate 업데이트
        workdataEntity.setRegDate(LocalDateTime.now());

        // 워크스페이스 정보 변경
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
        workdataEntity.setWorkspaceEntity(workspaceEntity);

        // 엔티티 저장 (JPA는 자동으로 변경 사항을 감지하여 업데이트)
        workdataRepository.save(workdataEntity);

        // DTO로 변환하여 결과 반환
        WorkdataDTO updatedWorkdataDTO = WorkdataDTO.toDTO(workdataEntity);
        return ResultDTO.of("자료글 수정에 성공했습니다.", updatedWorkdataDTO);
    }



}
