package net.scit.backend.workspace.service;

import java.util.List;

import net.scit.backend.member.dto.MemberLoginStatusDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.UpdateWorkspaceMemberDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.dto.WorkspaceMemberDTO;

@Service
public interface WorkspaceService
{
    ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO,  MultipartFile file);

    ResultDTO<SuccessDTO> workspaceDelete(String wsName);

    List<WorkspaceDTO> workspaceList();   
    
    ResultDTO<SuccessDTO> workspaceUpdate(String wsName,String newName,MultipartFile file) ;

    ResultDTO<SuccessDTO> workspaceInvate(Long wsId, String email);

    public ResultDTO<SuccessDTO> workspaceAdd(String code);

    public ResultDTO<SuccessDTO> workspaceWithDrwal(Long wsId);

    public ResultDTO<SuccessDTO> workspaceForceDrawal(Long wsId, String email);

    ResultDTO<SuccessDTO> workspaceRightCreate(Long wsId, String newRole);

    ResultDTO<SuccessDTO> workspaceRightGrant(Long wsId, String email,Long chRole);

    ResultDTO<SuccessDTO> workspaceRightDelete(Long wsId, Long chRole);

    ResultDTO<WorkspaceMemberDTO> getWorkspaceMemberInfo(Long wsId);

    ResultDTO<SuccessDTO> updateWorkspaceMemberInfo(Long wsId, UpdateWorkspaceMemberDTO updateInfo, MultipartFile file);

    List<MemberLoginStatusDTO> getWorkspaceMembersStatus(Long workspaceId, String userEmail);
}
