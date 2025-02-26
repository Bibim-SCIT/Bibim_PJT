package net.scit.backend.workdata.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.dto.WorkdataTotalSearchDTO;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface WorkdataService {

    //자료글 전체 조회
    ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(Long wsId, String sort, String order);

    //자료글 개별 조회
    ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(Long wsId, Long dataNumber);

    WorkdataEntity createWorkdataAndReturnEntity(Long wsId, WorkdataDTO workdataDTO);

    //자료 검색(workdata의 title, writer 기반)
    ResultDTO<List<WorkdataDTO>> searchWorkdata(Long wsId, String keyword, String sort, String order);

}
