package net.scit.backend.workdata.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface WorkdataService {

    //자료글 전체 조회
    ResultDTO<List<WorkdataDTO>> workdata(Long wsId);

    //자료글 개별 조회
    ResultDTO<WorkdataDTO> workdataDetail(Long wsId, Long dataNumber);

    //자료글 생성
    ResultDTO<SuccessDTO> workdataCreate(Long wsId, WorkdataDTO workdataDTO);

    //자료글 삭제
    ResultDTO<SuccessDTO> workdataDelete(Long wsId, Long dataNumber, String currentUserEmail);

    //자료글 수정
    ResultDTO<WorkdataDTO> workdataUpdate(Long wsId, Long dataNumber, WorkdataDTO workdataDTO);

    //자료 검색(workdata의 title, writer 기반)
    ResultDTO<List<WorkdataDTO>> searchWorkdata(Long wsId, String keyword);

    //자료 동적 정렬(writer, title, reg_date, file_name)
    ResultDTO<List<WorkdataDTO>> getSortedWorkdata(Long wsId, String sortField, String sortOrder);
}
