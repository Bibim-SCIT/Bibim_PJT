package net.scit.backend.schedule.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.schedule.dto.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public interface ScheduleService {
    ResultDTO<SuccessDTO> createSchedule(ScheduleDTO scheduleDTO);

    ResultDTO<List<ScheduleDTO>> getSchedules(Long wsId);

    ResultDTO<ScheduleDTO> getSchedule(Long scheduleNumber);

    ResultDTO<SuccessDTO> assignSchedule(Long scheduleNumber);

    ResultDTO<SuccessDTO> changeScheduleStatus(Long scheduleNumber, char status);

    ResultDTO<SuccessDTO> changeSchedule(Long scheduleNumber, ChangeScheduleDTO changeScheduleDTO);

    ResultDTO<SuccessDTO> createLargeTag(LargeTagDTO largeTagDTO);

    ResultDTO<SuccessDTO> createMediumTag(MediumTagDTO mediumTagDTO);
  
    ResultDTO<SuccessDTO> createSmallTag(SmallTagDTO smallTagDTO);

    ResultDTO<List<LargeTagDTO>> getLargeTags(Long wsId);
}
