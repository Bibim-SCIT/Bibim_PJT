package net.scit.backend.workdata.controller;

import com.amazonaws.services.s3.model.S3Object;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.workdata.dto.WorkdataDTO;
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
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
     * 1. 자료글 전체 조회
     */
    @GetMapping("")
    public ResponseEntity<ResultDTO<List<WorkdataDTO>>> workdata(@RequestParam Long wsId) {
        ResultDTO<List<WorkdataDTO>> result = workdataService.workdata(wsId);
        return ResponseEntity.ok(result);
    }

    /**
     * 2. 자료글 개별 조회
     */
    @GetMapping("/detail")
    public ResponseEntity<ResultDTO<WorkdataDTO>> workdataDetail(@RequestParam Long wsId,
                                                                 @RequestParam Long dataNumber) {

        // 전체 조회에서 접속 시 상세 정보 반환
        ResultDTO<WorkdataDTO> result = workdataService.workdataDetail(wsId, dataNumber);
        return ResponseEntity.ok(result);
    }


    /**
     * 3. 자료글 등록(+ 파일, 태그)
     */
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(
            @RequestParam("wsId") Long wsId,
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
     * 자료글 삭제(게시글 + 파일 + 태그 일괄 삭제)
     */
    @DeleteMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteWorkdata(
            @RequestParam Long wsId,
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
     * 5. 자료글 수정
     */
    @PutMapping("")
    public ResponseEntity<ResultDTO<WorkdataDTO>> workdataUpdate(@RequestParam Long wsId,
                                                                 @RequestParam Long dataNumber,
                                                                 @RequestBody WorkdataDTO workdataDTO,
                                                                 @RequestHeader("userName") String userName) {

        // workdataDTO에 작성자(userName) 설정
        workdataDTO.setWriter(userName);

        // 서비스 호출
        ResultDTO<WorkdataDTO> result = workdataService.workdataUpdate(wsId, dataNumber, workdataDTO);
        return ResponseEntity.ok(result);
    }

    /**
     * 7. 파일 다운로드
     */
    @GetMapping("/file")
    public ResponseEntity<InputStreamResource> downloadFile(@RequestParam("dataNumber") Long dataNumber,
                                                            @RequestParam("fileNumber") Long fileNumber) {
        try {
            // 자료글 조회
            WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dataNumber"));

            // fileNumber로 해당 파일 조회
            WorkdataFileEntity workdataFileEntity = (WorkdataFileEntity) workdataFileRepository.findByWorkdataEntityAndFileNumber(workdataEntity, fileNumber)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            // S3에서 파일 다운로드
            String fileUrl = workdataFileEntity.getFile();
            S3Object s3Object = s3Uploader.download(fileUrl);
            InputStreamResource resource = new InputStreamResource(s3Object.getObjectContent());

            // 다운로드 응답 생성 (파일명은 원본 fileName 사용)
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + workdataFileEntity.getFileName() + "\"")
                    .body(resource);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }


    /**
     * 8. 파일 개별 삭제
     */
    @DeleteMapping("/file")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteFile(@RequestParam("dataNumber") Long dataNumber,
                                                            @RequestParam("fileNumber") Long fileNumber) {
        try {
            // 자료글 조회
            WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dataNumber"));

            // fileNumber로 해당 파일 조회
            WorkdataFileEntity workdataFileEntity = (WorkdataFileEntity) workdataFileRepository.findByWorkdataEntityAndFileNumber(workdataEntity, fileNumber)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            // S3 파일 삭제
            String fileUrl = workdataFileEntity.getFile();
            URL url = new URL(fileUrl);
            String key = url.getPath().substring(1); // 앞의 '/' 제거
            s3Uploader.deleteFile(key);

            // DB 레코드 삭제
            workdataFileRepository.delete(workdataFileEntity);

            // 성공 응답 생성
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("파일 삭제에 성공하였습니다.")
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
                    .message("파일 삭제에 실패하였습니다: " + e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    /**
     * 9. 파일 수정(기존 파일 삭제 & 새로운 파일 업로드)
     */
    @PutMapping("/file")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateFile(@RequestParam("dataNumber") Long dataNumber,
                                                            @RequestParam("fileNumber") Long fileNumber,
                                                            @RequestParam("file") MultipartFile newFile) {
        try {
            // 자료글 조회
            WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dataNumber"));

            // fileNumber로 기존 파일 조회
            WorkdataFileEntity workdataFileEntity = (WorkdataFileEntity) workdataFileRepository.findByWorkdataEntityAndFileNumber(workdataEntity, fileNumber)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            // 기존 파일 S3 삭제
            String oldFileUrl = workdataFileEntity.getFile();
            URL url = new URL(oldFileUrl);
            String oldKey = url.getPath().substring(1);
            s3Uploader.deleteFile(oldKey);

            // 새로운 파일 업로드
            String newFileUrl = s3Uploader.upload(newFile, "workdata-files");

            // DB 정보 갱신 (파일 URL 및 원본 파일명 업데이트)
            workdataFileEntity.setFile(newFileUrl);
            workdataFileEntity.setFileName(newFile.getOriginalFilename());
            workdataFileRepository.save(workdataFileEntity);

            // 성공 응답 생성
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("파일 수정에 성공하였습니다.")
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
                    .message("파일 수정에 실패하였습니다: " + e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }


    /**
     * 10. 검색
     */
    @GetMapping("/search")
    public ResponseEntity<ResultDTO<List<WorkdataDTO>>> searchWorkdata(@RequestParam("wsId") Long wsId,
                                                                       @RequestParam("keyword") String keyword) {
        ResultDTO<List<WorkdataDTO>> result = workdataService.searchWorkdata(wsId, keyword);
        return ResponseEntity.ok(result);
    }

    /**
     * 11. 동적 자료 정렬(writer, title, reg_date, file_name)
     */
    @GetMapping("/sort")
    public ResponseEntity<ResultDTO<List<WorkdataDTO>>> getSortedWorkdata(
            @RequestParam("wsId") Long wsId,
            @RequestParam("sortField") String sortField,
            @RequestParam("sortOrder") String sortOrder) {
        ResultDTO<List<WorkdataDTO>> result = workdataService.getSortedWorkdata(wsId, sortField, sortOrder);
        return ResponseEntity.ok(result);
    }



    /**
     * 13. 태그 개별 삭제
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
     * 14. 태그 수정
     */
    @PutMapping("/file/tag")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateFileTag(
            @RequestParam("wsId") Long wsId,
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

            // 3. 요청 본문에서 기존 태그와 새 태그 값 추출
            String oldTag = requestBody.get("oldTag");
            String newTag = requestBody.get("newTag");

            if (oldTag == null || oldTag.trim().isEmpty()) {
                throw new IllegalArgumentException("수정할 기존 태그가 입력되지 않았습니다.");
            }
            if (newTag == null || newTag.trim().isEmpty()) {
                throw new IllegalArgumentException("새로운 태그가 입력되지 않았습니다.");
            }

            // 4. 새로운 태그 유효성 검사
            if (newTag.matches("^[가-힣]+$")) {  // 한글인 경우
                if (newTag.length() > 3) {
                    throw new IllegalArgumentException("한글 태그는 3글자 이하로 입력해주세요.");
                }
            } else if (newTag.matches("^[a-zA-Z]+$")) {  // 영어인 경우
                if (newTag.length() > 5) {
                    throw new IllegalArgumentException("영어 태그는 5글자 이하로 입력해주세요.");
                }
            } else {
                throw new IllegalArgumentException("태그는 한글 또는 영어만 사용 가능합니다.");
            }

            // 5. 기존 태그 엔티티 조회 (자료글에 연결된 태그 중 oldTag와 일치하는 엔티티)
            Optional<WorkDataFileTagEntity> tagEntityOpt = workdataFileTagRepository.findByTagAndWorkdataFileEntity_WorkdataEntity(oldTag, workdataEntity);
            if (!tagEntityOpt.isPresent()) {
                throw new IllegalArgumentException("해당 태그가 존재하지 않습니다.");
            }
            WorkDataFileTagEntity tagEntity = tagEntityOpt.get();

            // 6. 태그 수정 (새로운 태그 값으로 업데이트)
            tagEntity.setTag(newTag);
            workdataFileTagRepository.save(tagEntity);

            // 7. 성공 응답 반환
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("태그 수정에 성공하였습니다.")
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
                    .message("태그 수정에 실패하였습니다: " + e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
}
