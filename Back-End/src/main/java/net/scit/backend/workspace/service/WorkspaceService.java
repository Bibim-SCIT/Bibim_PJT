package net.scit.backend.workspace.service;

import java.util.List;

import net.scit.backend.member.dto.MemberLoginStatusDTO;
import org.springframework.security.core.Authentication;
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

    ResultDTO<SuccessDTO> workspaseInvate(Long wsId, String email);

    public ResultDTO<SuccessDTO> workspaseAdd(String code);

    public ResultDTO<SuccessDTO> workspaceWithDrwal(Long wsId);

    public ResultDTO<SuccessDTO> worksapceForceDrawal(Long wsId, String email);

    ResultDTO<SuccessDTO> worksapceRightCreate(Long wsId, String newRole);

    ResultDTO<SuccessDTO> worksapceRightGrant(Long wsId, String email,Long chRole);

    ResultDTO<SuccessDTO> worksapceRightDelete(Long wsId, Long chRole);

    ResultDTO<WorkspaceMemberDTO> getWorkspaceMemberInfo(Long wsId);

    ResultDTO<SuccessDTO> updateWorkspaceMemberInfo(Long wsId, UpdateWorkspaceMemberDTO updateInfo, MultipartFile file);

    List<MemberLoginStatusDTO> getWorkspaceMembersStatus(Long workspaceId, String userEmail);

    List<WorkspaceMemberDTO> getWorkspaceMembers(Long workspaceId, String email);
}
