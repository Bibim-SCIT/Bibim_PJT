package net.scit.backend.workspace.controller;

import java.util.List;

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
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
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
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    /**
     * 현재 유저의 모든 워크스페이스 반환 메소드
     * 
     * @return 워크스페이스 리스트 반환
     */
    @GetMapping("")
    public List<WorkspaceDTO> workspaceList() {
        return workspaceService.workspaceList();
    }

    /**
     * 워크스페이스 생성 메소드
     * 
     * @param workspaceDTO 워크스페이스 대한 정보 (이름과 사진)
     * @return 워크스페이스 생성 동작후 결과 확인
     */
    @PostMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceCreate(
            @ModelAttribute WorkspaceDTO workspaceDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceCreate(workspaceDTO, file);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 삭제 메소드
     * 
     * @param wsId         삭제할 워크스페이스 이름
     * @return
     */
    @DeleteMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceDelete(@RequestParam("wsId") Long wsId) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceDelete(wsId);
        return ResponseEntity.ok(result);
    }


    /**
     * 워크스페이스 업데이트 메소드
     * 
     * @param wsName  업데이트할 워크스페이스 이름
     * @param file    업데이트할 프로필 사진
     * @param newName 바꿀 이름
     * @return
     */
    @PutMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceUpdate(@RequestParam("wsName") String wsName,
            @RequestParam("newName") String newName,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceUpdate(wsName, newName, file);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 역할 세팅
     * 역할 : 유저, 관리자 2개
     * 
     * @return
     */
    @PatchMapping("/rolesetting")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceRoleSetting(@RequestParam("wsId") Long wsId,
            @RequestParam("email") String email,
            @RequestParam("newRole") String newRole) 
    {
        if(newRole.equals("owner") || newRole.equals("user"))
        {
            ResultDTO<SuccessDTO> result = workspaceService.workspaceRoleUpdate(wsId, email, newRole);
            return ResponseEntity.ok(result);
        }
        else
        {
            throw new CustomException(ErrorCode.INVALID_ROLE_VALUE);
        }
    }

    /**
     * 워크스페이스 초대
     * 
     * @return
     */
    @PostMapping("/invite")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceInvite(@RequestParam("wsId") Long wsId,
            @RequestParam("email") String email) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceInvite(wsId, email);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 초대 수락(참가)
     * 
     * @return
     */
    @PostMapping("/add")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceAdd(@RequestParam("code") String code) 
    {
        
        ResultDTO<SuccessDTO> result = workspaceService.workspaceAdd(code);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 탈퇴
     * 
     * @return
     */
    @DeleteMapping("/withdrawal")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceWithdrawal(@RequestParam("wsId") Long wsId) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceWithdrawal(wsId);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 강퇴
     * 
     * @return
     */
    @DeleteMapping("/forcedrawal")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceForceDrawal(@RequestParam("wsId") Long wsId,
            @RequestParam("email") String email) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceForceDrawal(wsId, email);
        return ResponseEntity.ok(result);
    }

    /**
     * 채널 권한 생성
     * 
     * @return
     */
    @PostMapping("/right")
    public ResponseEntity<ResultDTO<SuccessDTO>> wsRightCreate(@RequestParam("wsId") Long wsId,
            @RequestParam("newRole") String newRole) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceRightCreate(wsId, newRole);
        return ResponseEntity.ok(result);
    }

    /**
     * 채널 권한 부여
     * 
     * @return
     */
    @PatchMapping("/right")
    public ResponseEntity<ResultDTO<SuccessDTO>> wsRightGrant(@RequestParam("wsId") Long wsId,
            @RequestParam("email") String email, @RequestParam("chRole") Long chRole) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceRightGrant(wsId, email, chRole);
        return ResponseEntity.ok(result);
    }

    /**
     * 채널 권한 삭제
     * 
     * @return
     */
    @DeleteMapping("/right")
    public ResponseEntity<ResultDTO<SuccessDTO>> wsRightDelete(@RequestParam("wsId") Long wsId,
            @RequestParam("chRole") Long chRole) {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceRightDelete(wsId, chRole);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 나의 회원 정보 조회
     * 
     * @param wsId 조회할 워크스페이스 ID
     * @return
     */
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

    /**
     * 워크스페이스 나의 회원 정보 수정
     * 
     * @param wsId       워크스페이스 ID
     * @param updateInfo 수정할 정보
     * @param file       프로필 이미지 파일 (선택)
     * @return 수정 결과
     */
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

    /**
     * 워크스페이스 멤버의 접속현황 조회 엔드포인트
     *
     * @param workspaceId 조회할 워크스페이스의 ID (경로 변수)
     * @return ResultDTO에 담긴 멤버 접속현황 목록
     */
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

    /**
     * 워크스페이스 내 모든 멤버 조회
     *
     * @param workspaceId 조회할 워크스페이스 ID
     * @return 워크스페이스 멤버 목록
     */
    @GetMapping("/{workspaceId}/members")
    public List<WorkspaceMemberDTO> getWorkspaceMembers(
            @PathVariable("workspaceId") Long workspaceId) {
        String email = AuthUtil.getLoginUserId(); // 현재 로그인한 사용자
        if (email == null || email.isEmpty()) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        List<WorkspaceMemberDTO> members = workspaceService.getWorkspaceMembers(workspaceId, email);
        return members;
    }
}

