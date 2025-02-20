package net.scit.backend.schedule.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.schedule.dto.ScheduleDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ScheduleService {
    ResultDTO<SuccessDTO> createSchedule(ScheduleDTO scheduleDTO);

    ResultDTO<List<ScheduleDTO>> getSchedules(Long wsId);

    ResultDTO<ScheduleDTO> getSchedule(Long scheduleNumber);
}
