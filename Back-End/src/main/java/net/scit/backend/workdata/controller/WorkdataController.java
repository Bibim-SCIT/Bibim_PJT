package net.scit.backend.workdata.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.dto.WorkdataTotalSearchDTO;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

/**
 * WorkdataController
 * 자료글 CRUD 및 태그/검색 관련 API를 제공합니다.
 */
@Controller
@RestController
@RequestMapping("/workdata")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workdata API", description = "자료글 등록, 수정, 삭제, 검색 및 태그 관리 API")
public class WorkdataController {

    private final WorkdataService workdataService;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ObjectMapper objectMapper;

    /**
     * 자료글 생성 API
     * @param wsId 워크스페이스 ID
     * @param title 제목
     * @param content 내용
     * @param files 첨부 파일들 (optional)
     * @param tags 태그 리스트 (optional)
     * @return 생성된 자료글 DTO
     */
    @Operation(summary = "자료글 생성", description = "워크스페이스 ID를 기반으로 자료글을 생성합니다.")
    @PostMapping("/{wsId}")
    public ResponseEntity<ResultDTO<WorkdataDTO>> workdataCreate(
            @PathVariable Long wsId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "tags", required = false) List<String> tags) {
        try {
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
     * 자료글 삭제 API
     * @param wsId 워크스페이스 ID
     * @param dataNumber 자료글 ID
     * @return 삭제 성공 여부 DTO
     */
    @Operation(summary = "자료글 삭제", description = "워크스페이스 ID와 자료 번호를 이용해 자료글을 삭제합니다.")
    @DeleteMapping("/{wsId}/{dataNumber}")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteWorkdata(
            @PathVariable Long wsId,
            @PathVariable Long dataNumber) {
        try {
            ResultDTO<SuccessDTO> result = workdataService.deleteWorkdata(wsId, dataNumber);
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
     * JSON 문자열을 리스트로 변환하는 유틸 메서드
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
     * 자료글 수정 API (파일/태그 포함)
     * @return 성공 여부 DTO
     */
    @Operation(summary = "자료글 수정", description = "자료글 제목/내용/파일/태그를 수정합니다. Multipart 요청 필요")
    @PutMapping(value = "/{wsId}/{dataNumber}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataUpdate(@PathVariable Long wsId,
                                                                @PathVariable Long dataNumber,
                                                                @RequestParam(value = "title", required = false) String title,
                                                                @RequestParam(value = "content", required = false) String content,
                                                                @RequestParam(value = "deleteFiles", required = false) String deleteFilesJson,
                                                                @RequestParam(value = "deleteTags", required = false) String deleteTagsJson,
                                                                @RequestParam(value = "newTags", required = false) String newTagsJson,
                                                                @RequestParam(value = "files", required = false) MultipartFile[] newFiles) {
        try {
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
     * 자료글 전체 조회 (정렬 포함)
     * @return 자료글 리스트
     */
    @Operation(summary = "자료글 전체 조회", description = "워크스페이스 내 등록된 모든 자료글을 정렬 방식에 따라 조회합니다.")
    @GetMapping("/{wsId}")
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(
            @PathVariable Long wsId,
            @RequestParam(required = false, defaultValue = "regDate") String sort,
            @RequestParam(required = false, defaultValue = "desc") String order) {
        String userEmail = AuthUtil.getLoginUserId();
        workspaceMemberRepository.findByMember_EmailAndWorkspace_WsId(userEmail, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));
        return workdataService.workdata(wsId, sort, order);
    }

    /**
     * 자료글 상세 조회 API
     */
    @Operation(summary = "자료글 상세 조회", description = "자료글 ID를 통해 상세 정보를 조회합니다.")
    @GetMapping("/{wsId}/{dataNumber}")
    public ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(
            @PathVariable Long wsId,
            @PathVariable Long dataNumber) {
        String userEmail = AuthUtil.getLoginUserId();
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));
        return workdataService.workdataDetail(wsId, dataNumber);
    }

    /**
     * 사용 중인 전체 태그 조회 API
     */
    @Operation(summary = "태그 전체 조회", description = "워크스페이스 내 자료글에 사용된 모든 태그 목록을 조회합니다.")
    @GetMapping("/{wsId}/tags")
    public ResponseEntity<List<String>> getAllTags(@PathVariable Long wsId) {
        List<String> tags = workdataService.getAllTags(wsId);
        return ResponseEntity.ok(tags);
    }

    /**
     * 키워드 기반 자료글 검색 API
     */
    @Operation(summary = "자료글 키워드 검색", description = "제목, 작성자, 파일명, 태그에 대해 키워드로 검색합니다.")
    @GetMapping("/search/{wsId}")
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> searchWorkdata(
            @PathVariable Long wsId,
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "regDate") String sort,
            @RequestParam(required = false, defaultValue = "desc") String order) {
        String userEmail = AuthUtil.getLoginUserId();
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));
        ResultDTO<List<WorkdataTotalSearchDTO>> result = workdataService.searchWorkdata(wsId, keyword, sort, order);
        return ResponseEntity.ok(result);
    }
}
