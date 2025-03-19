package net.scit.backend.workdata.service;

import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.dto.WorkdataTotalSearchDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface WorkdataService {


    // 자료글 등록 (파일 및 태그 포함)
    WorkdataDTO createWorkdata(Long wsId, String title, String content, MultipartFile[] files, List<String> tags);

    //1-2) 자료글 삭제(+ 파일, 태그)
    ResultDTO<SuccessDTO> deleteWorkdata(Long wsId, Long dataNumber);

    //1-3) 자료글 수정(+ 파일, 태그)

    ResultDTO<SuccessDTO> updateWorkdata(Long wsId,
                                         Long dataNumber,
                                         String title,
                                         String content,
                                         List<String> deleteFiles,
                                         List<String> deleteTags,
                                         List<String> newTags,
                                         MultipartFile[] newFiles);


    //자료글 전체 조회
    ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(Long wsId, String sort, String order);

    //자료글 개별 조회
    ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(Long wsId, Long dataNumber);

    //태그 전체 조회
    List<String> getAllTags(Long wsId);

    //자료 검색(workdata의 title, writer 기반)
    ResultDTO<List<WorkdataTotalSearchDTO>> searchWorkdata(Long wsId, String keyword, String sort, String order);

}
