package net.scit.backend.schedule.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.schedule.dto.*;
import net.scit.backend.schedule.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/schedule")
@Tag(name = "스케줄 API", description = "스케줄 관리 및 태그 관리 API")
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 스케줄 생성
    @Operation(summary = "스케줄 생성", description = "새로운 스케줄을 생성합니다.")
    @PostMapping
    public ResponseEntity<ResultDTO<SuccessDTO>> createSchedule(@RequestBody ScheduleDTO scheduleDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.createSchedule(scheduleDTO);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "스케줄 목록 조회", description = "특정 워크스페이스의 스케줄 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ResultDTO<List<ScheduleDTO>>> getSchedules(@RequestParam Long wsId) {
        ResultDTO<List<ScheduleDTO>> result = scheduleService.getSchedules(wsId);
        return ResponseEntity.ok(result);
    }
    @Operation(summary = "단일 스케줄 조회", description = "스케줄 번호로 특정 스케줄을 조회합니다.")
    @GetMapping("/{scheduleNumber}")
    public ResponseEntity<ResultDTO<ScheduleDTO>> getSchedule(@PathVariable Long scheduleNumber) {
        ResultDTO<ScheduleDTO> result = scheduleService.getSchedule(scheduleNumber);
        return ResponseEntity.ok(result);
    }

    // 칸반에서 담당자 변경
    @Operation(summary = "칸반에서 담당자 변경", description = "칸반 보드에서 스케줄 담당자를 변경합니다.")
    @PutMapping("/{scheduleNumber}/assignees/kanban")
    public ResponseEntity<ResultDTO<SuccessDTO>> assignScheduleKanban(@PathVariable Long scheduleNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.assignScheduleKanban(scheduleNumber);
        return ResponseEntity.ok(result);
    }

    // 스케줄 상세 모달에서 담당자 변경
    @Operation(summary = "상세보기에서 담당자 변경", description = "상세보기 모달에서 스케줄 담당자를 변경합니다.")
    @PutMapping("/{scheduleNumber}/assignees/detail")
    public ResponseEntity<ResultDTO<SuccessDTO>> assignScheduleDetail(@PathVariable Long scheduleNumber,
            @RequestParam String email) {
        ResultDTO<SuccessDTO> result = scheduleService.assignScheduleDetail(scheduleNumber, email);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "스케줄 상태 변경", description = "스케줄의 상태를 변경합니다.")
    @PutMapping("/{scheduleNumber}/status")
    public ResponseEntity<ResultDTO<SuccessDTO>> changeScheduleStatus(@PathVariable Long scheduleNumber,
            @RequestParam char status) {
        ResultDTO<SuccessDTO> result = scheduleService.changeScheduleStatus(scheduleNumber, status);
        return ResponseEntity.ok(result);
    }

    // ✅ [추가] 스케줄 상세 모달에서 상태 변경 (기존 API 재활용)
    // @PutMapping("/{scheduleNumber}/status/detail")
    // public ResponseEntity<ResultDTO<SuccessDTO>> changeScheduleStatusFromDetail(
    // @PathVariable Long scheduleNumber, @RequestParam char status) {
    // ResultDTO<SuccessDTO> result =
    // scheduleService.changeScheduleStatus(scheduleNumber, status);
    // return ResponseEntity.ok(result);
    // }

    @Operation(summary = "스케줄 수정", description = "스케줄 상세 내용을 수정합니다.")
    @PutMapping("/{scheduleNumber}")
    public ResponseEntity<ResultDTO<SuccessDTO>> changeSchedule(@PathVariable Long scheduleNumber,
            @RequestBody ChangeScheduleDTO changeScheduleDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.changeSchedule(scheduleNumber, changeScheduleDTO);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "스케줄 삭제", description = "지정된 스케줄을 삭제합니다.")
    @DeleteMapping("/{scheduleNumber}")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteSchedule(@PathVariable Long scheduleNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.deleteSchedule(scheduleNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 대분류 태그 생성
     *
     * @param largeTagDTO
     * @return
     */
    @Operation(summary = "대분류 태그 생성", description = "워크스페이스에 대분류 태그를 생성합니다.")
    @PostMapping("/tag/large")
    public ResponseEntity<ResultDTO<SuccessDTO>> createLargeTag(@RequestBody LargeTagDTO largeTagDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.createLargeTag(largeTagDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 중분류 태그 생성
     *
     * @param mediumTagDTO
     * @return
     */
    @Operation(summary = "중분류 태그 생성", description = "워크스페이스에 중분류 태그를 생성합니다.")
    @PostMapping("/tag/medium")
    public ResponseEntity<ResultDTO<SuccessDTO>> createMediumTag(@RequestBody MediumTagDTO mediumTagDTO) {

        // mediumTagDTO.getLargeTagNumber()가 null인지 확인 // 요청 데이터 로그 출력
        log.info("Received MediumTagDTO: {}", mediumTagDTO);

        ResultDTO<SuccessDTO> result = scheduleService.createMediumTag(mediumTagDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 소분류 태그 생성
     *
     * @param smallTagDTO
     * @return
     */
    @Operation(summary = "소분류 태그 생성", description = "워크스페이스에 소분류 태그를 생성합니다.")
    @PostMapping("/tag/small")
    public ResponseEntity<ResultDTO<SuccessDTO>> createSmallTag(@RequestBody SmallTagDTO smallTagDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.createSmallTag(smallTagDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 대분류 태그 조회
     *
     * @param wsId
     * @return
     */
    @Operation(summary = "대분류 태그 조회", description = "워크스페이스에 대분류 태그를 조회합니다.")
    @GetMapping("/tag/large")
    public ResponseEntity<ResultDTO<List<LargeTagDTO>>> getLargeTags(@RequestParam(name = "wsId") Long wsId) {
        ResultDTO<List<LargeTagDTO>> result = scheduleService.getLargeTags(wsId);
        return ResponseEntity.ok(result);

    }

    /**
     * 중분류 태그 조회
     * 
     * @param wsId
     * @param largeTagNumber
     * @return
     */
    @Operation(summary = "중분류 태그 조회", description = "워크스페이스에 중분류 태그를 조회합니다.")
    @GetMapping("/tag/medium")
    public ResponseEntity<ResultDTO<List<MediumTagDTO>>> getMediumTags(@RequestParam(name = "wsId") Long wsId,
            @RequestParam(name = "largeTagNumber") Long largeTagNumber) {
        ResultDTO<List<MediumTagDTO>> result = scheduleService.getMediumTags(wsId, largeTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 소분류 태그 조회
     * 
     * @param wsId
     * @param largeTagNumber
     * @param mediumTagNumber
     * @return
     */
    @Operation(summary = "소분류 태그 조회", description = "워크스페이스에 소분류 태그를 조회합니다.")
    @GetMapping("/tag/small")
    public ResponseEntity<ResultDTO<List<SmallTagDTO>>> getSmallTags(@RequestParam(name = "wsId") Long wsId,
            @RequestParam(name = "largeTagNumber") Long largeTagNumber,
            @RequestParam(name = "mediumTagNumber") Long mediumTagNumber) {
        ResultDTO<List<SmallTagDTO>> result = scheduleService.getSmallTags(wsId, largeTagNumber, mediumTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 전체 태그 조회
     *
     * @param wsId 워크스페이스 ID
     * @return 전체 태그 계층 리스트
     */
    @Operation(summary = "태그 조회", description = "워크스페이스에 전체 태그를 조회합니다.")
    @GetMapping("/tag")
    public ResponseEntity<ResultDTO<TagListDTO>> getAllTags(@RequestParam(name = "wsId") Long wsId) {
        ResultDTO<TagListDTO> result = scheduleService.getAllTags(wsId);
        return ResponseEntity.ok(result);
    }

    /**
     * 대분류 태그 삭제
     * 
     * @param largeTagNumber
     * @return
     */
    @Operation(summary = "대분류 태그 삭제", description = "워크스페이스에 대분류 태그를 삭제합니다.")
    @DeleteMapping("/tag/large")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteLargeTag(
            @RequestParam(name = "largeTagNumber") Long largeTagNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.deleteLargeTag(largeTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 중분류 태그 삭제
     * 
     * @param mediumTagNumber
     * @return
     */
    @Operation(summary = "중분류 태그 삭제", description = "워크스페이스에 중분류 태그를 삭제합니다.")
    @DeleteMapping("/tag/medium")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteMediumTag(
            @RequestParam("mediumTagNumber") Long mediumTagNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.deleteMediumTag(mediumTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 소분류 태그 삭제
     * 
     * @param smallTagNumber
     * @return
     */
    @Operation(summary = "소분류 태그 삭제", description = "워크스페이스에 소분류 태그를 삭제합니다.")
    @DeleteMapping("/tag/small")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteSmallTag(@RequestParam("smallTagNumber") Long smallTagNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.deleteSmallTag(smallTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 대분류 태그 수정
     *
     * @param updateLargeTagDTO 요청 데이터
     * @return 성공 여부
     */
    @Operation(summary = "대분류 태그 수정", description = "워크스페이스에 대분류 태그를 수정합니다.")
    @PutMapping("/tag/large")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateLargeTag(@RequestBody UpdateLargeTagDTO updateLargeTagDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.updateLargeTag(updateLargeTagDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 중분류 태그 수정
     *
     * @param updateMediumTagDTO 요청 데이터
     * @return 성공 여부
     */
    @Operation(summary = "중분류 태그 삭제", description = "워크스페이스에 중분류 태그를 삭제합니다.")
    @PutMapping("/tag/medium")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateMediumTag(@RequestBody UpdateMediumTagDTO updateMediumTagDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.updateMediumTag(updateMediumTagDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 소분류 태그 수정
     *
     * @param updateSmallTagDTO 요청 데이터
     * @return 성공 여부
     */
    @Operation(summary = "소분류 태그 삭제", description = "워크스페이스에 소분류 태그를 삭제합니다.")
    @PutMapping("/tag/small")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateSmallTag(@RequestBody UpdateSmallTagDTO updateSmallTagDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.updateSmallTag(updateSmallTagDTO);
        return ResponseEntity.ok(result);
    }
}
