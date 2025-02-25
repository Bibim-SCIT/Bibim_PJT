package net.scit.backend.schedule.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.schedule.dto.*;
import net.scit.backend.schedule.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<ResultDTO<SuccessDTO>> createSchedule(@RequestBody ScheduleDTO scheduleDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.createSchedule(scheduleDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<ResultDTO<List<ScheduleDTO>>> getSchedules(@RequestParam Long wsId) {
        ResultDTO<List<ScheduleDTO>> result = scheduleService.getSchedules(wsId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{scheduleNumber}")
    public ResponseEntity<ResultDTO<ScheduleDTO>> getSchedule(@PathVariable Long scheduleNumber) {
        ResultDTO<ScheduleDTO> result = scheduleService.getSchedule(scheduleNumber);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{scheduleNumber}/assignees")
    public ResponseEntity<ResultDTO<SuccessDTO>> assignSchedule(@PathVariable Long scheduleNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.assignSchedule(scheduleNumber);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{scheduleNumber}/status")
    public ResponseEntity<ResultDTO<SuccessDTO>> changeScheduleStatus(@PathVariable Long scheduleNumber, @RequestParam char status) {
        ResultDTO<SuccessDTO> result = scheduleService.changeScheduleStatus(scheduleNumber, status);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{scheduleNumber}")
    public ResponseEntity<ResultDTO<SuccessDTO>> changeSchedule(@PathVariable Long scheduleNumber,
                                                                @RequestBody ChangeScheduleDTO changeScheduleDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.changeSchedule(scheduleNumber, changeScheduleDTO);
        return ResponseEntity.ok(result);
    }

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
    @PostMapping("/tag/medium")
    public ResponseEntity<ResultDTO<SuccessDTO>> createMediumTag(@RequestBody MediumTagDTO mediumTagDTO) {
        ResultDTO<SuccessDTO> result = scheduleService.createMediumTag(mediumTagDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 소분류 태그 생성
     *
     * @param smallTagDTO
     * @return
     */
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
    @GetMapping("/tag/large")
    public ResponseEntity<ResultDTO<List<LargeTagDTO>>> getLargeTags(@RequestParam Long wsId) {
        ResultDTO<List<LargeTagDTO>> result = scheduleService.getLargeTags(wsId);
        return ResponseEntity.ok(result);
      
    }

    /**
     * 중분류 태그 조회
     * 
     * @param largeTagNumber
     * @return
     */
    @GetMapping("/tag/medium")
    public ResponseEntity<ResultDTO<List<MediumTagDTO>>> getMediumTags(@RequestParam Long largeTagNumber) {
        ResultDTO<List<MediumTagDTO>> result = scheduleService.getMediumTags(largeTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 소분류 태그 조회
     * 
     * @param mediumTagNumber
     * @return
     */
    @GetMapping("/tag/small")
    public ResponseEntity<ResultDTO<List<SmallTagDTO>>> getSmallTags(@RequestParam Long mediumTagNumber) {
        ResultDTO<List<SmallTagDTO>> result = scheduleService.getSmallTags(mediumTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 대분류 태그 삭제
     * 
     * @param largeTagNumber
     * @return
     */
    @DeleteMapping("/tag/large")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteLargeTag(@RequestParam Long largeTagNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.deleteLargeTag(largeTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 중분류 태그 삭제
     * 
     * @param mediumTagNumber
     * @return
     */
    @DeleteMapping("/tag/medium")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteMediumTag(@RequestParam Long mediumTagNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.deleteMediumTag(mediumTagNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 소분류 태그 삭제
     * 
     * @param smallTagNumber
     * @return
     */
    @DeleteMapping("/tag/small")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteSmallTag(@RequestParam Long smallTagNumber) {
        ResultDTO<SuccessDTO> result = scheduleService.deleteSmallTag(smallTagNumber);
        return ResponseEntity.ok(result);
    }
}
