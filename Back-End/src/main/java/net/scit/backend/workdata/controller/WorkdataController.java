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

@Controller
@RestController
@RequestMapping("/workdata")
@RequiredArgsConstructor
@Slf4j
public class WorkdataController {

    private final WorkdataService workdataService;

    //1. 자료글 등록
    @PostMapping("/create")
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(@RequestBody WorkdataDTO workdataDTO, Long wsId){
        log.info("workdataDTO: {}", workdataDTO.toString());
        ResultDTO<SuccessDTO> result = workdataService.workdataCreate(workdataDTO, wsId);
        return ResponseEntity.ok(result);
    }

}
