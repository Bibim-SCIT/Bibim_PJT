package net.scit.backend.mypage.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

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
@Tag(name = "마이페이지 API", description = "스케줄 및 워크스페이스 데이터 조회 API")
public class MyPageController {

    private final MyPageService myPageService;

    /**
     * 내 스케줄 조회
     * @return 내 스케줄 목록
     */
    @Operation(
            summary = "내 스케줄 조회",
            description = "현재 로그인된 사용자의 스케줄 목록을 반환합니다.",
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "성공적으로 스케줄을 반환함",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MyScheduleDTO.class)))
            )
    )
    @GetMapping("/schedule")
    public ResponseEntity<ResultDTO<List<MyScheduleDTO>>> getSchedule() {
        ResultDTO<List<MyScheduleDTO>> result = myPageService.getSchedule();
        return ResponseEntity.ok(result);
    }

    /**
     * 모든 워크스페이스 데이터 조회
     * @return 모든 워크스페이스 데이터 목록
     */
    @Operation(
            summary = "워크스페이스 데이터 전체 조회",
            description = "현재 사용자가 접근 가능한 모든 워크스페이스 자료를 조회합니다.",
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "성공적으로 워크스페이스 데이터를 반환함",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = AllWorkspaceDataDTO.class)))
            )
    )
    @GetMapping("/workdata")
    public ResponseEntity<ResultDTO<List<AllWorkspaceDataDTO>>> getWorkdata() {
        ResultDTO<List<AllWorkspaceDataDTO>> result = myPageService.getWorkData();
        return ResponseEntity.ok(result);
    }
}
