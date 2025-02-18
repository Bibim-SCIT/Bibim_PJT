package net.scit.backend.workspace.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.service.WorkspaceService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
public class WorkspaceController 
{
    private final WorkspaceService workspaceService;

    /**
     * 현재 유저의 모든 워크스페이스 반환 메소드
     * @return 워크스페이스 리스트 반환
     */
    @GetMapping("")
    public ResponseEntity<ResultDTO<List<WorkspaceDTO>>> workspaceList() {
        ResultDTO<List<WorkspaceDTO>> result = workspaceService.workspaceList();
        return ResponseEntity.ok(result);
    }
    

    /**
     * 워크스페이스 생성 메소드
     * @param WorkspaceDTO 워크스페이스 대한 정보 (이름과 사진)
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
     * @param authentication 현재 로그인한 유저 정보보
     * @return
     */
    @DeleteMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceDelete(@RequestParam String wsName)
    {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceDelete(wsName);
        return ResponseEntity.ok(result);
    }
    
}
