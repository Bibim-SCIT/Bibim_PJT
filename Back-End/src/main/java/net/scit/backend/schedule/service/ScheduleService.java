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

    ResultDTO<SuccessDTO> deleteSchedule(Long scheduleNumber);

    ResultDTO<SuccessDTO> createLargeTag(LargeTagDTO largeTagDTO);

    ResultDTO<SuccessDTO> createMediumTag(MediumTagDTO mediumTagDTO);

    ResultDTO<SuccessDTO> createSmallTag(SmallTagDTO smallTagDTO);

    ResultDTO<List<LargeTagDTO>> getLargeTags(Long wsId);

    ResultDTO<List<MediumTagDTO>> getMediumTags(Long wsId, Long largeTagNumber);

    ResultDTO<List<SmallTagDTO>> getSmallTags(Long wsId, Long largeTagNumber, Long mediumTagNumber);

    ResultDTO<List<TagListDTO>> getAllTags(Long wsId);

    ResultDTO<SuccessDTO> deleteLargeTag(Long largeTagNumber);

    ResultDTO<SuccessDTO> deleteMediumTag(Long mediumTagNumber);

    ResultDTO<SuccessDTO> deleteSmallTag(Long smallTagNumber);

    ResultDTO<SuccessDTO> updateLargeTag(UpdateLargeTagDTO updateLargeTagDTO);

    ResultDTO<SuccessDTO> updateMediumTag(UpdateMediumTagDTO updateMediumTagDTO);

    ResultDTO<SuccessDTO> updateSmallTag(UpdateSmallTagDTO updateSmallTagDTO);

}
