package net.scit.backend.workdata.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RestController
@RequestMapping("/workdata")
@RequiredArgsConstructor
@Slf4j
public class WorkdataController {

    private final WorkdataService workdataService;

    /**
     * 1. 자료글 전체 조회
     */
    @GetMapping("")
    public ResponseEntity<ResultDTO<List<WorkdataDTO>>> workdata() {
        ResultDTO<List<WorkdataDTO>> result = workdataService.workdata();
        return ResponseEntity.ok(result);
    }

    /**
     * 2. 자료글 등록
     */
    @PostMapping("/create")
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(@RequestParam Long wsId, @RequestBody WorkdataDTO workdataDTO){
        log.info("workdataDTO: {}", workdataDTO);
        log.info("wsId: {}", wsId);

        ResultDTO<SuccessDTO> result = workdataService.workdataCreate(wsId, workdataDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 3. 자료실 삭제
     */
    @DeleteMapping("/delete")
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataDelete(@RequestParam Long wsId, @RequestBody WorkdataDTO workdataDTO) {
        log.info("workdataDTO: {}", workdataDTO);
        log.info("wsId: {}", wsId);

        ResultDTO<SuccessDTO> result = workdataService.workdataDelete(wsId, workdataDTO);
        return ResponseEntity.ok(result);
    }
}
