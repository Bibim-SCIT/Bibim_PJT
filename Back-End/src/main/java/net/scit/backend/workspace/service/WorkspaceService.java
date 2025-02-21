package net.scit.backend.workspace.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Service
public interface WorkspaceService
{
    ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO,  MultipartFile file);

    ResultDTO<SuccessDTO> workspaceDelete(String wsName);

    List<WorkspaceDTO> workspaceList();   
    
    ResultDTO<SuccessDTO> workspaceUpdate(String wsName,String newName,MultipartFile file) ;

    ResultDTO<SuccessDTO> workspaseInvate(String wsName, String email);

    public ResultDTO<SuccessDTO> workspaseAdd(Long wsId, Boolean YorN);

    public ResultDTO<SuccessDTO> workspaceWithDrwal(String wsName);

}
