package net.scit.backend.workdata.controller;

import com.amazonaws.services.s3.model.S3Object;

import com.fasterxml.jackson.core.type.TypeReference;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.dto.WorkdataTotalSearchDTO;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import net.scit.backend.workdata.repository.WorkdataFileRepository;
import net.scit.backend.workdata.repository.WorkdataFileTagRepository;
import net.scit.backend.workdata.repository.WorkdataRepository;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RestController
@RequestMapping("/workdata")
@RequiredArgsConstructor
@Slf4j
public class WorkdataController {

    private final WorkdataService workdataService;
    private final WorkdataRepository workdataRepository;
    private final WorkdataFileRepository workdataFileRepository;
    private final S3Uploader s3Uploader;
    private final WorkspaceRepository workspaceRepository;
    private final WorkdataFileTagRepository workdataFileTagRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ObjectMapper objectMapper;


    /**
     * 1-1) 자료글 등록(+ 파일, 태그)
     */
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(
            @RequestParam("wsId") Long wsId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "tags", required = false) java.util.List<String> tags) {

        try {
            // 1. 현재 로그인한 사용자의 이메일 가져오기
            String email = AuthUtil.getLoginUserId();

            // 2. 워크스페이스 & 사용자 검증
            Optional<WorkspaceMemberEntity> optionalWs = workspaceMemberRepository
                    .findByWorkspace_wsIdAndMember_Email(wsId, email);
            if (optionalWs.isEmpty()) {
                throw new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.");
            }

            // 3. WorkdataDTO 객체 생성
            WorkdataDTO workdataDTO = new WorkdataDTO();
            workdataDTO.setTitle(title);
            workdataDTO.setContent(content);
            workdataDTO.setWriter(email);

            // 4. 서비스 호출 (자료글 생성, 파일 업로드, 태그 추가 모두 처리)
            workdataService.createWorkdata(wsId, workdataDTO, files, tags);

            // 5. 성공 응답 반환
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            return ResponseEntity.ok(ResultDTO.of("자료글 등록, 파일 업로드, 태그 추가 완료!", successDTO));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ResultDTO.of(e.getMessage(), SuccessDTO.builder().success(false).build()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResultDTO.of("처리 중 오류 발생: " + e.getMessage(), SuccessDTO.builder().success(false).build()));
        }
    }


    /**
     * 1-2.1) 자료글 삭제(+파일, 태그)
     */
    @DeleteMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteWorkdata(@RequestParam Long wsId,
                                                                @RequestParam Long dataNumber) {
        try {
            // 1. 로그인 사용자 이메일 & 워크스페이스 검증
            String email = AuthUtil.getLoginUserId();
            Optional<WorkspaceMemberEntity> optionalMember =
                    workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email);
            if (optionalMember.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ResultDTO.of("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.",
                                SuccessDTO.builder().success(false).build()));
            }

            // 2. 서비스 호출 (삭제 로직 처리)
            ResultDTO<SuccessDTO> result = workdataService.deleteWorkdata(wsId, dataNumber, email);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ResultDTO.of(e.getMessage(), SuccessDTO.builder().success(false).build()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResultDTO.of("자료글 삭제 중 오류 발생: " + e.getMessage(),
                            SuccessDTO.builder().success(false).build()));
        }
    }


    /**
     * 1-2.2) 태그 개별 삭제
     */
    @DeleteMapping("/file/tag")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteFileTag( @RequestParam("wsId") Long wsId,
                                                                @RequestParam("dataNumber") Long dataNumber,
                                                                @RequestBody Map<String, String> requestBody) {
        try {
            // 1. 워크스페이스 검증
            Optional<WorkspaceEntity> workspaceOpt = workspaceRepository.findById(wsId);
            if (!workspaceOpt.isPresent()) {
                throw new IllegalArgumentException("워크스페이스를 찾을 수 없습니다.");
            }
            WorkspaceEntity workspaceEntity = workspaceOpt.get();

            // 2. 자료글 검증
            Optional<WorkdataEntity> workdataOpt = workdataRepository.findByDataNumberAndWorkspaceEntity(dataNumber, workspaceEntity);
            if (!workdataOpt.isPresent()) {
                throw new IllegalArgumentException("자료글을 찾을 수 없습니다.");
            }
            WorkdataEntity workdataEntity = workdataOpt.get();

            // 3. 삭제할 태그 값 확인 (JSON에서 "tag" 필드)
            String tag = requestBody.get("tag");
            if (tag == null || tag.trim().isEmpty()) {
                throw new IllegalArgumentException("삭제할 태그가 입력되지 않았습니다.");
            }

            // 4. 해당 태그 엔티티 조회
            Optional<WorkDataFileTagEntity> tagEntityOpt = workdataFileTagRepository.findByTagAndWorkdataFileEntity_WorkdataEntity(tag, workdataEntity);
            if (!tagEntityOpt.isPresent()) {
                throw new IllegalArgumentException("해당 태그가 존재하지 않습니다.");
            }

            // 5. 태그 삭제
            workdataFileTagRepository.delete(tagEntityOpt.get());

            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("태그 삭제에 성공하였습니다.")
                    .data(successDTO)
                    .build();
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            SuccessDTO failureDTO = SuccessDTO.builder().success(false).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message(e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.badRequest().body(result);
        } catch (Exception e) {
            SuccessDTO failureDTO = SuccessDTO.builder().success(false).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("태그 삭제에 실패하였습니다: " + e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }


    /**
     * 1-3) 자료글 수정 (파일, 태그 일괄 수정)
     * JSON 데이터는 @RequestPart로 받습니다.
     *
     * Postman에서는 multipart/form-data로 요청하되,
     * 각 JSON 필드(tagRequests, deleteFiles, deleteTags, newTags)는
     * "Content-Type"을 "application/json"으로 설정해서 전송하세요.
     */
//    @PutMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<ResultDTO<SuccessDTO>> workdataUpdate(
//            @RequestParam Long wsId,
//            @RequestParam Long dataNumber,
//            @RequestParam(value = "title", required = false) String title,
//            @RequestParam(value = "content", required = false) String content,
//
//            // JSON 데이터를 String으로 받고, 컨트롤러에서 List로 변환
//            @RequestParam(value = "deleteFiles", required = false) String deleteFilesJson,
//            @RequestParam(value = "oldTags", required = false) String oldTagsJson, // 기존 태그
//            @RequestParam(value = "newTags", required = false) String newTagsJson, // 새로운 태그
//
//            // 새 파일 추가
//            @RequestParam(value = "files", required = false) MultipartFile[] newFiles
//    ) {
//        try {
//            String userEmail = AuthUtil.getLoginUserId();
//            log.info("로그인 사용자: {}", userEmail);
//
//            // JSON 문자열을 List로 변환
//            List<String> deleteFiles = parseJsonArray(deleteFilesJson, new TypeReference<List<String>>() {});
//            List<String> oldTags = parseJsonArray(oldTagsJson, new TypeReference<List<String>>() {});
//            List<String> newTags = parseJsonArray(newTagsJson, new TypeReference<List<String>>() {});
//
//            // 서비스 호출
//            ResultDTO<SuccessDTO> result = workdataService.updateWorkdata(
//                    wsId, dataNumber, title, content,
//                    deleteFiles, oldTags, newTags,
//                    newFiles, userEmail
//            );
//
//            return ResponseEntity.ok(result);
//
//        } catch (IllegalArgumentException e) {
//            log.error("IllegalArgumentException 발생: {}", e.getMessage());
//            return ResponseEntity.badRequest()
//                    .body(ResultDTO.of(e.getMessage(), SuccessDTO.builder().success(false).build()));
//        } catch (Exception e) {
//            log.error("자료글 수정 중 오류 발생: {}", e.getMessage(), e);
//            return ResponseEntity.status(500)
//                    .body(ResultDTO.of("자료글 수정 중 오류 발생: " + e.getMessage(),
//                            SuccessDTO.builder().success(false).build()));
//        }
//    }
//
//    /**
//     * JSON 문자열을 List<T>로 변환하는 헬퍼 메서드
//     */
//    private <T> List<T> parseJsonArray(String jsonStr, TypeReference<List<T>> typeRef) {
//        if (jsonStr == null || jsonStr.trim().isEmpty()) {
//            return Collections.emptyList();
//        }
//        try {
//            ObjectMapper objectMapper = new ObjectMapper();
//            return objectMapper.readValue(jsonStr, typeRef);
//        } catch (JsonProcessingException e) {
//            log.warn("JSON 파싱 오류: {}", e.getMessage());
//            return Collections.emptyList();
//        }
//    }





    /**
     * 1-4-1) 자료글 전체 조회(+태그별 정렬)
     */
    @GetMapping("")
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(
            @RequestParam Long wsId,
            @RequestParam(required = false, defaultValue = "regDate") String sort,
            @RequestParam(required = false, defaultValue = "desc") String order) {

        // 1. 로그인 사용자 이메일 조회
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 워크스페이스 검증
        Optional<WorkspaceMemberEntity> optionalMember =
                workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail);
        if (optionalMember.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ResultDTO.of("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.", new ArrayList<>()));
        }

        // 3. 서비스 호출 (반환 타입 일치)
        return workdataService.workdata(wsId, sort, order);
    }


    /**
     * 1-4-2) 자료실 개별 조회
     */
    @GetMapping("/detail")
    public ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(
            @RequestParam Long wsId,
            @RequestParam Long dataNumber) {

        // 1. 로그인 사용자 이메일 조회
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 워크스페이스 검증
        Optional<WorkspaceMemberEntity> optionalMember =
                workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail);
        if (optionalMember.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ResultDTO.of("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.", null));
        }

        // 3. 서비스 호출
        return workdataService.workdataDetail(wsId, dataNumber);
    }



    /**
     * 2. 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ResultDTO<List<WorkdataDTO>>> searchWorkdata( @RequestParam Long wsId,
                                                                        @RequestParam String keyword,
                                                                        @RequestParam(required = false, defaultValue = "regDate") String sort,
                                                                        @RequestParam(required = false, defaultValue = "desc") String order) {

        // 1. 로그인 사용자 이메일 조회
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 워크스페이스 검증
        Optional<WorkspaceMemberEntity> optionalMember =
                workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail);
        if (optionalMember.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ResultDTO.of("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.", new ArrayList<>()));
        }

        // 3. 서비스 호출
        return ResponseEntity.ok(workdataService.searchWorkdata(wsId, keyword, sort, order));
    }


}
