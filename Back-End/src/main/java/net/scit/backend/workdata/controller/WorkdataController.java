package net.scit.backend.workdata.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Controller
@RestController
@RequestMapping("/workdata")
@RequiredArgsConstructor
public class WorkdataController {

    private final WorkdataService workdataService;

    //1. 자료글 등록
    @PostMapping("/create")
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(@ModelAttribute WorkdataDTO workdataDTO){
        ResultDTO<SuccessDTO> result = workdataService.workdataCreate(workdataDTO);
        return ResponseEntity.ok(result);
    }

}
