package net.scit.backend.mypage.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.mypage.dto.AllWorkspaceDataDTO;
import net.scit.backend.mypage.dto.MyScheduleDTO;
import net.scit.backend.mypage.service.MyPageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/schedule")
    public ResponseEntity<ResultDTO<List<MyScheduleDTO>>> getSchedule() {
        ResultDTO<List<MyScheduleDTO>> result = myPageService.getSchedule();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/workdata")
    public ResponseEntity<ResultDTO<List<AllWorkspaceDataDTO>>> getWorkdata() {
        ResultDTO<List<AllWorkspaceDataDTO>> result = myPageService.getWorkData();
        return ResponseEntity.ok(result);
    }
}
