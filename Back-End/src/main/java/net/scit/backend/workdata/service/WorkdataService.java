package net.scit.backend.workdata.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface WorkdataService {
    ResultDTO<List<WorkdataDTO>> workdata();

    ResultDTO<SuccessDTO> workdataCreate(Long wsId, WorkdataDTO workdataDTO);

    ResultDTO<SuccessDTO> workdataDelete(Long wsId, WorkdataDTO workdataDTO);
}
