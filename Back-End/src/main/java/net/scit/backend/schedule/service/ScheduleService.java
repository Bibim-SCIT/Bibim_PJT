package net.scit.backend.schedule.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.schedule.dto.ScheduleDTO;
import org.springframework.stereotype.Service;

@Service
public interface ScheduleService {
    ResultDTO<SuccessDTO> scheduleRegist(ScheduleDTO scheduleDTO);
}
