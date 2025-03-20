package net.scit.backend.mypage.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.mypage.dto.AllWorkspaceDataDTO;
import net.scit.backend.mypage.dto.MyScheduleDTO;
import net.scit.backend.mypage.service.MyPageService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class MyPageController {

    private final MyPageService myPageService;

    /**
     * 내 스케줄 조회
     * @return 내 스케줄 목록
     */
    @GetMapping("/schedule")
    public ResponseEntity<ResultDTO<List<MyScheduleDTO>>> getSchedule() {
        ResultDTO<List<MyScheduleDTO>> result = myPageService.getSchedule();
        return ResponseEntity.ok(result);
    }

    /**
     * 모든 워크스페이스 데이터 조회
     * @return 모든 워크스페이스 데이터 목록
     */
    @GetMapping("/workdata")
    public ResponseEntity<ResultDTO<List<AllWorkspaceDataDTO>>> getWorkdata() {
        ResultDTO<List<AllWorkspaceDataDTO>> result = myPageService.getWorkData();
        return ResponseEntity.ok(result);
    }
}
