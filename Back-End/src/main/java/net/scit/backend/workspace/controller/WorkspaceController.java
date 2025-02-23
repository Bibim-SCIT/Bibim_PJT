package net.scit.backend.workspace.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.InvateWorkspaceDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.service.WorkspaceService;

import java.util.List;

import org.hibernate.annotations.Fetch;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;





@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
@Slf4j
public class WorkspaceController 
{
    private final WorkspaceService workspaceService;

    /**
     * 현재 유저의 모든 워크스페이스 반환 메소드
     * @return 워크스페이스 리스트 반환
     */
    @GetMapping("")
    public List<WorkspaceDTO> workspaceList() {
        return workspaceService.workspaceList();
    }

    /**
     * 워크스페이스 생성 메소드
     * @param workspaceDTO 워크스페이스 대한 정보 (이름과 사진)
     * @return 워크스페이스 생성 동작후 결과 확인인
     */
    @PostMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceCreate(
                                @ModelAttribute WorkspaceDTO workspaceDTO,
                                @RequestPart(value = "file", required = false) MultipartFile file)
    {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceCreate(workspaceDTO,file);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 삭제 메소드
     * @param wsName 삭제할 워크스페이스 이름
     * @param authentication 현재 로그인한 유저 정보
     * @return
     */
    @DeleteMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceDelete(@RequestParam String wsName)
    {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceDelete(wsName);
        return ResponseEntity.ok(result);
    }
    
    /**
     * 워크스페이스 업데이트 메소드
     * @param wsName 업데이트할 워크스페이스 이름
     * @param file 업데이트할 프로필 사진
     * @param newName 바꿀 이름
     * @return
     */
    @PutMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceUpdate(@RequestParam String wsName,
                                                                 @RequestParam String newName, 
                                                                 @RequestPart(value = "file", required = false) MultipartFile file) 
    {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceUpdate(wsName,newName,file);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 역할 세팅
     * 역할 : 유저, 관리자 2개
     * @return
     */
    @PatchMapping("/rolesetting")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceRoleSetting()
    {
        // ResultDTO<SuccessDTO> result = workspaceService.workspaceUpdate(wsName,newName,file);
        return null;
    }

    /**
     * 워크스페이스 초대
     * @return
     */
    @PostMapping("/invite")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaseInvate(@RequestParam("wsId") Long wsId,
                                                                @RequestParam("email") String email) 
    {
        ResultDTO<SuccessDTO> result = workspaceService.workspaseInvate(wsId,email);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 초대 수락(참가)
     * @return
     */
    @PostMapping("/add")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaseAdd(@ModelAttribute InvateWorkspaceDTO invateWorkspaceDTO) 
    {
        
        ResultDTO<SuccessDTO> result = workspaceService.workspaseAdd(invateWorkspaceDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 탈퇴
     * @return
     */
    @DeleteMapping("/withdrawal")
    public ResponseEntity<ResultDTO<SuccessDTO>>  workspaceWithDrwal(@RequestParam("wsId") Long wsId)
    {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceWithDrwal(wsId);
        return ResponseEntity.ok(result);
    }

    /**
     * 워크스페이스 강퇴
     * @return
     */
    @DeleteMapping("/forcedrawal")
    public ResponseEntity<ResultDTO<SuccessDTO>> worksapceForceDrawal(@RequestParam("wsId") Long wsId, @RequestParam String email)
    {
        ResultDTO<SuccessDTO> result = workspaceService.worksapceForceDrawal(wsId, email);
        return ResponseEntity.ok(result);
    }

    /**
     * 채널 권한 생성
     * @return
     */
    @PostMapping("/right")
    public String wsRightCreate()
    {
        return null;
    }
    
    /**
     * 채널 권한 부여
     * @return
     */
    @PatchMapping("/right")
    public String wsRightGrant()
    {
        return null;
    }

    /**
     * 채널 권한 삭제
     * @return
     */
    @DeleteMapping("/right")
    public String wsRightDelete()
    {
        return null;
    }

    


}
