package net.scit.backend.workspace.service;

import org.springframework.stereotype.Service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;

@Service
public interface WorkspaceService
{
    ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO);

    ResultDTO<SuccessDTO> workspaceRead(WorkspaceDTO workspaceDTO);
}
