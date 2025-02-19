package net.scit.backend.workdata.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import org.springframework.stereotype.Service;

@Service
public interface WorkdataService {
    ResultDTO<SuccessDTO> workdataCreate(WorkdataDTO workdataDTO);
}
