package net.scit.backend.workspace.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.member.dto.MemberLoginStatusDTO;
import net.scit.backend.workspace.dto.UpdateWorkspaceMemberDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.dto.WorkspaceMemberDTO;
import net.scit.backend.workspace.service.WorkspaceService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
@Slf4j
@Tag(name = "워크스페이스 API", description = "워크스페이스 생성, 수정, 삭제, 멤버 관리, 권한 부여 등의 기능 제공")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    /** 현재 유저의 모든 워크스페이스 반환 메소드 */
    @Operation(summary = "워크스페이스 목록 조회", description = "현재 로그인된 사용자가 속한 워크스페이스 목록을 반환합니다.")
    @GetMapping("")
    public List<WorkspaceDTO> workspaceList() {
        return workspaceService.workspaceList();
    }

    /** 워크스페이스 생성 메소드 */
    @Operation(summary = "워크스페이스 생성", description = "워크스페이스 이름과 프로필 이미지를 등록하여 새 워크스페이스를 생성합니다.")
    @PostMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceCreate(
            @ModelAttribute WorkspaceDTO workspaceDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceCreate(workspaceDTO, file);
        return ResponseEntity.ok(result);
    }

    /** 워크스페이스 삭제 메소드 */
    @Operation(summary = "워크스페이스 삭제", description = "워크스페이스 ID를 기반으로 해당 워크스페이스를 삭제합니다.")
    @DeleteMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceDelete(@RequestParam("wsId") Long wsId) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceDelete(wsId);
        return ResponseEntity.ok(result);
    }

    /** 워크스페이스 업데이트 메소드 */
    @Operation(summary = "워크스페이스 수정", description = "워크스페이스 이름과 프로필 사진을 수정합니다.")
    @PutMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceUpdate(@RequestParam("wsName") String wsName,
                                                                 @RequestParam("newName") String newName,
                                                                 @RequestPart(value = "file", required = false) MultipartFile file) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceUpdate(wsName, newName, file);
        return ResponseEntity.ok(result);
    }

    /** 워크스페이스 역할 세팅 (유저 or 관리자) */
    @Operation(summary = "워크스페이스 역할 변경", description = "워크스페이스 내 사용자의 역할을 owner 또는 user로 변경합니다.")
    @PatchMapping("/rolesetting")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceRoleSetting(@RequestParam("wsId") Long wsId,
                                                                      @RequestParam("email") String email,
                                                                      @RequestParam("newRole") String newRole) {
        if(newRole.equals("owner") || newRole.equals("user")) {
            ResultDTO<SuccessDTO> result = workspaceService.workspaceRoleUpdate(wsId, email, newRole);
            return ResponseEntity.ok(result);
        } else {
            throw new CustomException(ErrorCode.INVALID_ROLE_VALUE);
        }
    }

    /** 워크스페이스 초대 */
    @Operation(summary = "워크스페이스 초대", description = "이메일을 통해 사용자를 워크스페이스에 초대합니다.")
    @PostMapping("/invite")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceInvite(@RequestParam("wsId") Long wsId,
                                                                 @RequestParam("email") String email) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceInvite(wsId, email);
        return ResponseEntity.ok(result);
    }

    /** 워크스페이스 초대 수락 */
    @Operation(summary = "워크스페이스 초대 수락", description = "초대 코드를 통해 워크스페이스에 가입합니다.")
    @PostMapping("/add")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceAdd(@RequestParam("code") String code) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceAdd(code);
        return ResponseEntity.ok(result);
    }

    /** 워크스페이스 탈퇴 */
    @Operation(summary = "워크스페이스 탈퇴", description = "현재 사용자가 워크스페이스에서 탈퇴합니다.")
    @DeleteMapping("/withdrawal")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceWithdrawal(@RequestParam("wsId") Long wsId) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceWithdrawal(wsId);
        return ResponseEntity.ok(result);
    }

    /** 워크스페이스 강제 탈퇴 */
    @Operation(summary = "워크스페이스 강제 탈퇴", description = "다른 사용자를 워크스페이스에서 강제로 탈퇴시킵니다.")
    @DeleteMapping("/forcedrawal")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceForceDrawal(@RequestParam("wsId") Long wsId,
                                                                      @RequestParam("email") String email) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceForceDrawal(wsId, email);
        return ResponseEntity.ok(result);
    }

    /** 채널 권한 생성 */
    @Operation(summary = "채널 권한 생성", description = "워크스페이스에 새로운 채널 권한을 추가합니다.")
    @PostMapping("/right")
    public ResponseEntity<ResultDTO<SuccessDTO>> wsRightCreate(@RequestParam("wsId") Long wsId,
                                                               @RequestParam("newRole") String newRole) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceRightCreate(wsId, newRole);
        return ResponseEntity.ok(result);
    }

    /** 채널 권한 부여 */
    @Operation(summary = "채널 권한 부여", description = "사용자에게 특정 채널 권한을 부여합니다.")
    @PatchMapping("/right")
    public ResponseEntity<ResultDTO<SuccessDTO>> wsRightGrant(@RequestParam("wsId") Long wsId,
                                                              @RequestParam("email") String email, @RequestParam("chRole") Long chRole) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceRightGrant(wsId, email, chRole);
        return ResponseEntity.ok(result);
    }

    /** 채널 권한 삭제 */
    @Operation(summary = "채널 권한 삭제", description = "워크스페이스의 채널 권한을 삭제합니다.")
    @DeleteMapping("/right")
    public ResponseEntity<ResultDTO<SuccessDTO>> wsRightDelete(@RequestParam("wsId") Long wsId,
                                                               @RequestParam("chRole") Long chRole) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceRightDelete(wsId, chRole);
        return ResponseEntity.ok(result);
    }

    /** 워크스페이스 내 나의 정보 조회 */
    @Operation(summary = "워크스페이스 내 나의 정보 조회", description = "현재 로그인된 사용자의 워크스페이스 내 정보를 조회합니다.")
    @GetMapping("/myinfo")
    public ResponseEntity<ResultDTO<WorkspaceMemberDTO>> getWorkspaceMemberInfo(
            @RequestParam(required = true, name = "wsId") Long wsId) {
        try {
            ResultDTO<WorkspaceMemberDTO> result = workspaceService.getWorkspaceMemberInfo(wsId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw e;
        }
    }

    /** 워크스페이스 내 나의 정보 수정 */
    @Operation(summary = "워크스페이스 내 나의 정보 수정", description = "닉네임, 상태 메시지, 프로필 이미지를 수정합니다.")
    @PutMapping("/myinfo")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateWorkspaceMemberInfo(
            @RequestParam Long wsId,
            @RequestPart(value = "info") UpdateWorkspaceMemberDTO updateInfo,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            ResultDTO<SuccessDTO> result = workspaceService.updateWorkspaceMemberInfo(wsId, updateInfo, file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw e;
        }
    }

    /** 워크스페이스 내 전체 멤버의 접속 상태 조회 */
    @Operation(summary = "워크스페이스 멤버 접속현황 조회", description = "워크스페이스에 속한 모든 멤버의 온라인/오프라인 상태 및 최근 접속 시간을 조회합니다.")
    @GetMapping("/{workspaceId}/members/status")
    public ResponseEntity<ResultDTO<List<MemberLoginStatusDTO>>> getWorkspaceMembersStatus(
            @PathVariable Long workspaceId) {
        String email = AuthUtil.getLoginUserId();
        if (email == null || email.isEmpty()) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        List<MemberLoginStatusDTO> statusList = workspaceService.getWorkspaceMembersStatus(workspaceId, email);
        return ResponseEntity.ok(ResultDTO.of("워크스페이스 멤버 접속 현황 조회 성공", statusList));
    }

    /** 워크스페이스 내 전체 멤버 목록 조회 */
    @Operation(summary = "워크스페이스 멤버 전체 조회", description = "워크스페이스에 속한 모든 멤버의 정보를 조회합니다.")
    @GetMapping("/{workspaceId}/members")
    public List<WorkspaceMemberDTO> getWorkspaceMembers(
            @PathVariable("workspaceId") Long workspaceId) {
        String email = AuthUtil.getLoginUserId();
        if (email == null || email.isEmpty()) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        List<WorkspaceMemberDTO> members = workspaceService.getWorkspaceMembers(workspaceId, email);
        return members;
    }
}
