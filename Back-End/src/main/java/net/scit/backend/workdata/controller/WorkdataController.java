package net.scit.backend.workdata.controller;

import com.amazonaws.services.s3.model.S3Object;

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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    /**
     * 1-1) 자료글 등록(+ 파일, 태그)
     */
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(@RequestParam("wsId") Long wsId,
                                                                @RequestParam("title") String title,
                                                                @RequestParam("content") String content,
                                                                @RequestParam(value = "files", required = false) MultipartFile[] files,
                                                                @RequestParam(value = "tags", required = false) List<String> tags) {

        try {
            // 1. 현재 로그인한 사용자의 이메일 가져오기
            String email = AuthUtil.getLoginUserId();

            // 2. 워크스페이스 & 사용자 검증
            Optional<WorkspaceMemberEntity> optionalWsId =
                    workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email);
            if (optionalWsId.isEmpty()) {
                throw new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.");
            }

            // 3. WorkdataDTO 객체 생성
            WorkdataDTO workdataDTO = new WorkdataDTO();
            workdataDTO.setTitle(title);
            workdataDTO.setContent(content);
            workdataDTO.setWriter(email);

            // 4. 자료글 생성 후, 생성된 WorkdataEntity를 바로 반환받는다고 가정
            //    (Service에서 save 한 다음 Entity 혹은 Entity의 id를 돌려주는 방식)
            WorkdataEntity workdataEntity = workdataService.createWorkdataAndReturnEntity(wsId, workdataDTO);

            // 5. 파일 업로드 (파일이 존재하는 경우)
            if (files != null && files.length > 0) {
                int existingFileCount = workdataFileRepository.countByWorkdataEntity(workdataEntity);

                if (existingFileCount + files.length > 10) {
                    throw new IllegalArgumentException("최대 10개의 파일만 업로드할 수 있습니다.");
                }

                for (MultipartFile file : files) {
                    // S3에 업로드
                    String fileUrl = s3Uploader.upload(file, "workdata-files");

                    // WorkdataFileEntity 생성 & 저장
                    WorkdataFileEntity workdataFileEntity = WorkdataFileEntity.builder()
                            .workdataEntity(workdataEntity)
                            .file(fileUrl)
                            .fileName(file.getOriginalFilename())
                            .build();
                    workdataFileRepository.save(workdataFileEntity);
                }
            }
            // 6. 태그 추가 (태그가 존재하는 경우)
            if (tags != null && !tags.isEmpty()) {
                int currentTagCount = workdataFileTagRepository.countByWorkdataFileEntity_WorkdataEntity(workdataEntity);

                if (currentTagCount + tags.size() > 3) {
                    throw new IllegalArgumentException("이미 태그가 3개 등록되어 더 이상 추가할 수 없습니다.");
                }

                // 파일 중 하나를 찾아 태그 추가(첫 번째 파일 사용 예시)
                WorkdataFileEntity firstFileEntity =
                        workdataFileRepository.findFirstByWorkdataEntity(workdataEntity);
                if (firstFileEntity == null) {
                    throw new IllegalArgumentException("해당 자료글에 연결된 파일이 없습니다.");
                }

                for (String tag : tags) {
                    // 한글 3글자 이하, 영어 5글자 이하, 한글·영어만 허용
                    if (tag.matches("^[가-힣]+$") && tag.length() > 3) {
                        throw new IllegalArgumentException("한글 태그는 3글자 이하로 입력해주세요.");
                    } else if (tag.matches("^[a-zA-Z]+$") && tag.length() > 5) {
                        throw new IllegalArgumentException("영어 태그는 5글자 이하로 입력해주세요.");
                    } else if (!tag.matches("^[가-힣a-zA-Z]+$")) {
                        throw new IllegalArgumentException("태그는 한글 또는 영어만 사용 가능합니다.");
                    }

                    WorkDataFileTagEntity tagEntity = WorkDataFileTagEntity.builder()
                            .workdataFileEntity(firstFileEntity)
                            .tag(tag)
                            .build();
                    workdataFileTagRepository.save(tagEntity);
                }
            }

            // ✅ 최종 성공 응답
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            return ResponseEntity.ok(
                    ResultDTO.of("자료글 등록, 파일 업로드, 태그 추가 완료!", successDTO)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ResultDTO.of(e.getMessage(), SuccessDTO.builder().success(false).build()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResultDTO.of("처리 중 오류 발생: " + e.getMessage(), SuccessDTO.builder().success(false).build()));
        }
    }


    /**
     * 1-2.1) 자료글 삭제(게시글 + 파일 + 태그 일괄 삭제)
     */
    @DeleteMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteWorkdata(@RequestParam Long wsId,
                                                                @RequestParam Long dataNumber) {

        try {
            // 1. 로그인 사용자 이메일 & 워크스페이스 검증
            String email = AuthUtil.getLoginUserId();

            // (wsId, email)이 같은지 확인
            Optional<WorkspaceMemberEntity> optionalMember =
                    workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email);
            if (optionalMember.isEmpty()) {
                throw new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.");
            }

            // 2. 자료글 조회
            WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                    .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
            WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspaceEntity(dataNumber, workspaceEntity)
                    .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

            // 3. 작성자와 현재 로그인 사용자가 같은지 확인 (옵션)
            if (!workdataEntity.getWriter().equals(email)) {
                throw new IllegalArgumentException("본인만 삭제할 수 있습니다.");
            }

            // 4. 자료글(WorkdataEntity) 자체 삭제
            //    Cascade 설정에 의해 파일, 태그도 함께 삭제됨 (DB 연관관계)
            workdataRepository.delete(workdataEntity);

            // 5. 성공 응답 생성
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("자료글 및 관련 파일/태그 삭제(컬럼 Cascade)에 성공하였습니다.")
                    .data(successDTO)
                    .build();
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            // 잘못된 요청
            SuccessDTO failureDTO = SuccessDTO.builder().success(false).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message(e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.badRequest().body(result);
        } catch (Exception e) {
            // 기타 예외
            SuccessDTO failureDTO = SuccessDTO.builder().success(false).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("자료글 삭제 중 오류 발생: " + e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
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
     * 1-3. 자료글 수정(파일, 태그 일괄 수정)
     */
    @PutMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataUpdate(@RequestParam Long wsId,
            @RequestParam Long dataNumber,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "content", required = false) String content,

            // 파일 삭제 목록 (JSON 배열) 예: ["file1.jpg","file2.png"]
            @RequestParam(value = "deleteFiles", required = false) String deleteFilesJson,

            // 태그 수정 목록 (JSON 배열)
            // 예: [ { "oldTag": "java", "newTag": "spring" }, { "oldTag": "db", "newTag": "mysql"} ]
            @RequestParam(value = "tagRequests", required = false) String tagRequestsJson,

            // 새로 추가할 파일들
            @RequestParam(value = "files", required = false) MultipartFile[] newFiles
    ) {
        try {
            // 1. 로그인 사용자 이메일
            String userEmail = AuthUtil.getLoginUserId(); // JWT/세션 등 실제 구현

            // 2. 워크스페이스 검증
            Optional<WorkspaceMemberEntity> optionalMember =
                    workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail);
            if (optionalMember.isEmpty()) {
                // 실패 응답
                SuccessDTO failDto = SuccessDTO.builder().success(false).build();
                return ResponseEntity.badRequest()
                        .body(ResultDTO.of("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다.", failDto));
            }

            // 3. 자료글 조회
            WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                    .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
            WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspaceEntity(dataNumber, workspaceEntity)
                    .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

            // 4. 작성자 검증
            if (!workdataEntity.getWriter().equals(userEmail)) {
                SuccessDTO failDto = SuccessDTO.builder().success(false).build();
                return ResponseEntity.badRequest()
                        .body(ResultDTO.of("본인만 수정할 수 있습니다.", failDto));
            }

            // 5. 파일 삭제
            if (deleteFilesJson != null && !deleteFilesJson.isEmpty()) {
                ObjectMapper objectMapper = new ObjectMapper();
                List<?> rawDeleteList = objectMapper.readValue(deleteFilesJson, List.class);  // List<Object>
                List<String> deleteFiles = rawDeleteList.stream()
                        .map(Object::toString)
                        .collect(Collectors.toList());

                for (String fileName : deleteFiles) {
                    Optional<WorkdataFileEntity> fileEntityOpt =
                            workdataFileRepository.findByFileNameAndWorkdataEntity(fileName, workdataEntity);
                    if (fileEntityOpt.isPresent()) {
                        WorkdataFileEntity fileEntity = fileEntityOpt.get();

                        // S3 파일 삭제
                        String fileUrl = fileEntity.getFile();
                        URL url = new URL(fileUrl);
                        String key = url.getPath().substring(1);
                        s3Uploader.deleteFile(key);

                        // DB에서 파일 삭제
                        workdataFileRepository.delete(fileEntity);
                    }
                }
            }

            // 6. 태그 수정
            if (tagRequestsJson != null && !tagRequestsJson.isEmpty()) {
                ObjectMapper objectMapper = new ObjectMapper();
                List<?> rawTagList = objectMapper.readValue(tagRequestsJson, List.class);  // List<Object>
                // 예: [ { "oldTag": "java", "newTag": "spring" }, ...]
                // 다운캐스팅 후 Map<String, String> 변환
                List<Map<String, String>> tagRequests = rawTagList.stream()
                        .map(obj -> (Map<String, String>) obj)
                        .collect(Collectors.toList());

                for (Map<String, String> tagRequest : tagRequests) {
                    String oldTag = tagRequest.get("oldTag");
                    String newTag = tagRequest.get("newTag");

                    if (oldTag == null || oldTag.trim().isEmpty()) {
                        throw new IllegalArgumentException("수정할 기존 태그가 입력되지 않았습니다.");
                    }
                    if (newTag == null || newTag.trim().isEmpty()) {
                        throw new IllegalArgumentException("새로운 태그가 입력되지 않았습니다.");
                    }

                    // 태그 유효성 검사 (한글 3글자 이하, 영어 5글자 이하, 한글/영어만)
                    if (newTag.matches("^[가-힣]+$") && newTag.length() > 3) {
                        throw new IllegalArgumentException("한글 태그는 3글자 이하로 입력해주세요.");
                    } else if (newTag.matches("^[a-zA-Z]+$") && newTag.length() > 5) {
                        throw new IllegalArgumentException("영어 태그는 5글자 이하로 입력해주세요.");
                    } else if (!newTag.matches("^[가-힣a-zA-Z]+$")) {
                        throw new IllegalArgumentException("태그는 한글 또는 영어만 사용 가능합니다.");
                    }

                    // 기존 태그 엔티티 조회
                    Optional<WorkDataFileTagEntity> tagEntityOpt =
                            workdataFileTagRepository.findByTagAndWorkdataFileEntity_WorkdataEntity(oldTag, workdataEntity);
                    if (tagEntityOpt.isEmpty()) {
                        throw new IllegalArgumentException("해당 태그가 존재하지 않습니다.");
                    }

                    // 태그 수정
                    WorkDataFileTagEntity tagEntity = tagEntityOpt.get();
                    tagEntity.setTag(newTag);
                    workdataFileTagRepository.save(tagEntity);
                }
            }

            // 7. 새 파일 업로드 (기존 파일 유지)
            if (newFiles != null && newFiles.length > 0) {
                for (MultipartFile file : newFiles) {
                    String fileUrl = s3Uploader.upload(file, "workdata-files");
                    WorkdataFileEntity newFileEntity = WorkdataFileEntity.builder()
                            .workdataEntity(workdataEntity)
                            .file(fileUrl)
                            .fileName(file.getOriginalFilename())
                            .build();
                    workdataFileRepository.save(newFileEntity);
                }
            }

            // 8. 자료글 (제목, 내용) 수정
            if (title != null) {
                workdataEntity.setTitle(title);
            }
            if (content != null) {
                workdataEntity.setContent(content);
            }
            workdataRepository.save(workdataEntity);

            // ✅ 9. 성공 응답
            SuccessDTO successDto = SuccessDTO.builder().success(true).build();
            return ResponseEntity.ok(
                    ResultDTO.of("자료글 수정, 파일 삭제/추가, 태그 수정 완료!", successDto)
            );

        } catch (IllegalArgumentException e) {
            // 잘못된 요청
            SuccessDTO failDto = SuccessDTO.builder().success(false).build();
            return ResponseEntity.badRequest().body(
                    ResultDTO.of(e.getMessage(), failDto)
            );

        } catch (Exception e) {
            // 기타 서버 오류
            SuccessDTO failDto = SuccessDTO.builder().success(false).build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResultDTO.of("자료글 수정 중 오류 발생: " + e.getMessage(), failDto));
        }
    }


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
