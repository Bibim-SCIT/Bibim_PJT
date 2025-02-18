package net.scit.backend.workspace.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.service.WorkspaceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
public class WorkspaceController 
{
    private final WorkspaceService workspaceService;

    /**
     * 워크스페이스 생성 메소드
     * @param workspaceDTO 워크스페이스 대한 정보 (이름과 사진)
     * @return 워크스페이스 생성 동작후 결과 확인인
     */
    @PostMapping("/create")
    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceCreate(@ModelAttribute WorkspaceDTO workspaceDTO)
    {
        ResultDTO<SuccessDTO> result = workspaceService.workspaceCreate(workspaceDTO);
        return ResponseEntity.ok(result);
    }

//    /**
//     * 워크스페이스 조회 메소드
//     * @param workspaceDTO
//     * @return
//     */
//    @GetMapping("/read")
//    public ResponseEntity<ResultDTO<SuccessDTO>> workspaceRead(@ModelAttribute WorkspaceDTO workspaceDTO)
//    {
//        ResultDTO<SuccessDTO> result = workspaceService.workspaceRead(workspaceDTO);
//        return null;
//    }


}
