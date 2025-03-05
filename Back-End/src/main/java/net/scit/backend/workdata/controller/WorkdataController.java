package net.scit.backend.workdata.controller;


import com.fasterxml.jackson.core.type.TypeReference;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.dto.WorkdataTotalSearchDTO;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Controller
@RestController
@RequestMapping("/workdata")
@RequiredArgsConstructor
@Slf4j
public class WorkdataController {

    private final WorkdataService workdataService;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ObjectMapper objectMapper;


    /**
     * 1-1) 게시글 생성 (PathVariable로 wsId 전달)
     */
    @PostMapping("/{wsId}")
    public ResponseEntity<ResultDTO<WorkdataDTO>> workdataCreate(
            @PathVariable Long wsId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "tags", required = false) List<String> tags) {
        try {
            // 현재 로그인한 사용자의 email을 SecurityContext에서 가져온다고 가정
            // 예: String email = SecurityContextHolder.getContext().getAuthentication().getName();
            WorkdataDTO responseDTO = workdataService.createWorkdata(wsId, title, content, files, tags);
            return ResponseEntity.ok(ResultDTO.of("자료글 등록 성공!", responseDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResultDTO.of(e.getMessage(), null));
        } catch (Exception e) {
            log.error("게시글 등록 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResultDTO.of("처리 중 오류 발생: " + e.getMessage(), null));
        }
    }



    /**
     * 1-2.1) 자료글 삭제 (+파일, +태그)
     */
    @DeleteMapping("/{wsId}/{dataNumber}")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteWorkdata(
            @RequestHeader("Authorization") String token,
            @PathVariable Long wsId,
            @PathVariable Long dataNumber) {
        try {
            ResultDTO<SuccessDTO> result = workdataService.deleteWorkdata(token, wsId, dataNumber);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ResultDTO.of(e.getMessage(), SuccessDTO.builder().success(false).build()));
        } catch (Exception e) {
            log.error("자료글 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResultDTO.of("자료글 삭제 중 오류 발생: " + e.getMessage(),
                            SuccessDTO.builder().success(false).build()));
        }
    }



    /**
     * 문자열(JSON 배열)을 List<T>로 변환하는 헬퍼 메서드
     * @param jsonStr JSON 배열 문자열
     * @param typeRef 변환할 타입 (예: new TypeReference<List<String>>() {})
     * @return 변환된 List<T> 또는 변환 실패 시 빈 리스트 반환
     */
    private <T> List<T> parseJsonArray(String jsonStr, TypeReference<List<T>> typeRef) {
        if (jsonStr == null || jsonStr.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(jsonStr, typeRef);
        } catch (JsonProcessingException e) {
            log.warn("JSON 파싱 오류: {}", e.getMessage());
            return Collections.emptyList();
        }
    }


    /**
     * 1-3) 자료글 수정 (파일, 태그 일괄 수정)
     * JSON 데이터는 @RequestPart로 받습니다.
     *
     * Postman에서는 multipart/form-data로 요청하되,
     * 각 JSON 필드(tagRequests, deleteFiles, deleteTags, newTags)는
     * \"Content-Type\"을 \"application/json\"으로 설정해서 전송하세요.
     */
    @PutMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataUpdate(@RequestParam Long wsId,
                                                                @RequestParam Long dataNumber,
                                                                @RequestParam(value = "title", required = false) String title,
                                                                @RequestParam(value = "content", required = false) String content,
                                                                @RequestParam(value = "deleteFiles", required = false) String deleteFilesJson,
                                                                @RequestParam(value = "deleteTags", required = false) String deleteTagsJson,
                                                                @RequestParam(value = "newTags", required = false) String newTagsJson,
                                                                @RequestParam(value = "files", required = false) MultipartFile[] newFiles) {
        try {
            // JSON 문자열을 List<String>으로 파싱
            List<String> deleteFiles = parseJsonArray(deleteFilesJson, new TypeReference<List<String>>() {});
            List<String> deleteTags = parseJsonArray(deleteTagsJson, new TypeReference<List<String>>() {});
            List<String> newTags = parseJsonArray(newTagsJson, new TypeReference<List<String>>() {});

            ResultDTO<SuccessDTO> result = workdataService.updateWorkdata(
                    wsId, dataNumber, title, content,
                    deleteFiles, deleteTags, newTags, newFiles
            );

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("자료글 수정 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResultDTO.of("자료글 수정 중 오류 발생: " + e.getMessage(),
                            SuccessDTO.builder().success(false).build()));
        }
    }

    /**
     * 1-4-1) 자료글 전체 조회(+태그별 정렬)
     */
    @GetMapping("")
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(@RequestParam Long wsId,
                                                                            @RequestParam(required = false, defaultValue = "regDate") String sort,
                                                                            @RequestParam(required = false, defaultValue = "desc") String order) {
        // 1. 로그인 사용자 이메일 조회
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 워크스페이스 검증
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 3. 서비스 호출 후 응답 반환
        return workdataService.workdata(wsId, sort, order);
    }


    /**
     * 1-4-2) 자료실 개별 조회
     */
    @GetMapping("/detail")
    public ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(@RequestParam Long wsId,
                                                                            @RequestParam Long dataNumber) {
        // 1. 로그인 사용자 이메일 조회
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 워크스페이스 검증
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 3. 서비스 호출 후 응답 반환
        return workdataService.workdataDetail(wsId, dataNumber);
    }

    /**
     * 2. 검색
     * keyword는 workdata의 title, writer, fileName, tag에서 찾을 수 있음
     */
    @GetMapping("/search")
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> searchWorkdata(@RequestParam Long wsId,
                                                                                  @RequestParam String keyword,
                                                                                  @RequestParam(required = false, defaultValue = "regDate") String sort,
                                                                                  @RequestParam(required = false, defaultValue = "desc") String order) {
        // 1) 로그인 사용자 이메일 조회
        String userEmail = AuthUtil.getLoginUserId();

        // 2) 워크스페이스 검증
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 3) 서비스 호출
        ResultDTO<List<WorkdataTotalSearchDTO>> result = workdataService.searchWorkdata(wsId, keyword, sort, order);

        // 4) 결과 반환
        return ResponseEntity.ok(result);
    }

}
