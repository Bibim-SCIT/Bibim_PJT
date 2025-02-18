package net.scit.backend.workspace.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;

@Service
public interface WorkspaceService
{
    ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO,  MultipartFile file);

    ResultDTO<SuccessDTO> workspaceDelete(String wsName);

    ResultDTO<SuccessDTO> workspaceList();   
}
