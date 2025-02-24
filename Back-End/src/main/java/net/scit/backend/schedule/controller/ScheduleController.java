package net.scit.backend.schedule.controller;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.schedule.dto.ScheduleDTO;
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
}
