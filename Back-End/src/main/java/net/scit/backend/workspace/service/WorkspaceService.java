package net.scit.backend.workspace.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.InvateWorkspaceDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Service
public interface WorkspaceService
{
    ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO,  MultipartFile file);

    ResultDTO<SuccessDTO> workspaceDelete(String wsName);

    List<WorkspaceDTO> workspaceList();   
    
    ResultDTO<SuccessDTO> workspaceUpdate(String wsName,String newName,MultipartFile file) ;

    ResultDTO<SuccessDTO> workspaseInvate(Long wsId, String email);

    public ResultDTO<SuccessDTO> workspaseAdd(InvateWorkspaceDTO invateWorkspaceDTO);

    public ResultDTO<SuccessDTO> workspaceWithDrwal(Long wsId);

    public ResultDTO<SuccessDTO> worksapceForceDrawal(Long wsId, String email);

}
