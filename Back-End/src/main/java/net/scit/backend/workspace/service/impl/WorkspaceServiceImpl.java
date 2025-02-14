package net.scit.backend.workspace.service.impl;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import net.scit.backend.workspace.service.WorkspaceService;

@Service
@RequiredArgsConstructor
public class WorkspaceServiceImpl implements WorkspaceService
{
    private final WorkspaceRepository workspaceRepository;

    /**
     * 워크스페이스 생성 메소드드
     * @param workspaceDTO 워크스페이스 대한 정보
     * @return 결과 확인 메세지
     */
    @Override
    public ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO) 
    {
        WorkspaceEntity workspaceEntity;
        workspaceEntity = WorkspaceEntity.toEntity(workspaceDTO);
        workspaceRepository.save(workspaceEntity);
        // 성공시 DTO 저장
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("워크스페이스 생성에 성공했습니다.", successDTO);

    }

}
