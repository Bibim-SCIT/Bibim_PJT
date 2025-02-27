package net.scit.backend.workdata.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.dto.WorkdataTotalSearchDTO;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface WorkdataService {

    //1-1) 자료글 등록(+ 파일, 태그)
    // 자료글 생성 및 파일/태그 추가
    void createWorkdata(Long wsId, WorkdataDTO dto, MultipartFile[] files, List<String> tags);
    // 단순 자료글 생성을 위한 메서드 (내부 호출용)
    WorkdataEntity createWorkdataAndReturnEntity(Long wsId, WorkdataDTO dto);

    //1-2) 자료글 삭제(+ 파일, 태그)
    ResultDTO<SuccessDTO> deleteWorkdata(Long wsId, Long dataNumber, String email);

    //1-3) 자료글 수정(+ 파일, 태그)
    ResultDTO<SuccessDTO> updateWorkdata(
            Long wsId,
            Long dataNumber,
            String title,
            String content,
            List<String> deleteFiles,
            List<String> newTags,
            MultipartFile[] newFiles
    );

    //자료글 전체 조회
    ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(Long wsId, String sort, String order);

    //자료글 개별 조회
    ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(Long wsId, Long dataNumber);

    //자료 검색(workdata의 title, writer 기반)
    ResultDTO<List<WorkdataDTO>> searchWorkdata(Long wsId, String keyword, String sort, String order);

}
