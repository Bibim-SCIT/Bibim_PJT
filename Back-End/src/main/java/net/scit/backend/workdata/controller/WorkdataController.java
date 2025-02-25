package net.scit.backend.workdata.controller;

import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import net.scit.backend.workspace.repository.WorkspaceRepository;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
     * 3. 자료글 등록
     */
    @PostMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> workdataCreate(@RequestParam Long wsId,
                                                                @RequestBody WorkdataDTO workdataDTO,
                                                                @RequestHeader("userEmail") String userEmail) {

        // writer 값을 자동으로 설정 (현재 로그인한 사용자 정보)
        workdataDTO.setWriter(userEmail);  // 헤더에서 받아온 이메일을 writer로 설정

        // 서비스 호출
        ResultDTO<SuccessDTO> result = workdataService.workdataCreate(wsId, workdataDTO);
        return ResponseEntity.ok(result);
    }


    /**
     * 4. 자료실 삭제
     */
    @DeleteMapping("")
    public ResultDTO<SuccessDTO> deleteWorkdata(@RequestParam Long wsId,
                                                @RequestParam Long dataNumber,
                                                @RequestBody DeleteRequestBody requestBody) {

        // 이메일 값을 RequestBody에서 받아서 서비스 메소드에 전달
        return workdataService.workdataDelete(wsId, dataNumber, requestBody.getUserName());
    }

    // 이메일을 RequestBody로 받을 때 사용하는 DTO 클래스
    public static class DeleteRequestBody {
        private String userName; // 이메일 주소

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
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
     * 6. 파일 등록
     */
    @PostMapping("/file")
    public ResponseEntity<ResultDTO<SuccessDTO>> uploadFile(@RequestParam("dataNumber") Long dataNumber,
                                                            @RequestParam("file") MultipartFile file) {
        try {
            // S3에 파일 업로드
            String fileUrl = s3Uploader.upload(file, "workdata-files");
            log.info("fileUrl: {}", fileUrl);

            // WorkdataEntity 조회
            WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dataNumber"));

            // DB에 파일 정보 저장
            WorkdataFileEntity workdataFileEntity = WorkdataFileEntity.builder()
                    .workdataEntity(workdataEntity)
                    .file(fileUrl)
                    .fileName(file.getOriginalFilename())
                    .build();
            workdataFileRepository.save(workdataFileEntity);

            // 성공 응답 생성
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("파일 등록에 성공하였습니다.")
                    .data(successDTO)
                    .build();
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            SuccessDTO failureDTO = SuccessDTO.builder().success(false).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("파일 등록에 실패하였습니다: " + e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    /**
     * 7. 파일 다운로드
     */
    @GetMapping("/file")
    public ResponseEntity<InputStreamResource> downloadFile(@RequestParam("dataNumber") Long dataNumber,
                                                            @RequestParam("fileName") String fileName) {
        try {
            // WorkdataEntity 찾기
            WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dataNumber"));

            // WorkdataFileEntity 찾기
            WorkdataFileEntity workdataFileEntity = workdataFileRepository.findByWorkdataEntityAndFileName(workdataEntity, fileName)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            // S3에서 파일 다운로드
            String fileUrl = workdataFileEntity.getFile();
            S3Object s3Object = s3Uploader.download(fileUrl);

            // InputStream을 InputStreamResource로 변환 (스트림은 닫지 않음)
            InputStreamResource resource = new InputStreamResource(s3Object.getObjectContent());

            // 파일 다운로드 응답 생성
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();  // 잘못된 요청
        } catch (Exception e) {
            return ResponseEntity.status(500).build();  // 기타 에러
        }
    }

    /**
     * 8. 파일 삭제
     */
    @DeleteMapping("/file")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteFile(@RequestParam("dataNumber") Long dataNumber,
                                                            @RequestParam("fileName") String fileName) {
        try {
            // WorkdataEntity 조회
            WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dataNumber"));

            // WorkdataFileEntity 조회
            WorkdataFileEntity workdataFileEntity = workdataFileRepository.findByWorkdataEntityAndFileName(workdataEntity, fileName)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            // S3 키 추출 및 S3 파일 삭제
            String fileUrl = workdataFileEntity.getFile();
            URL url = new URL(fileUrl);
            String key = url.getPath().substring(1);
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
                                                            @RequestParam("fileName") String fileName,
                                                            @RequestParam("file") MultipartFile newFile) {
        try {
            // WorkdataEntity 조회
            WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid dataNumber"));

            // 기존 파일 정보 조회
            WorkdataFileEntity workdataFileEntity = workdataFileRepository.findByWorkdataEntityAndFileName(workdataEntity, fileName)
                    .orElseThrow(() -> new IllegalArgumentException("File not found"));

            // 기존 파일 S3 삭제
            String oldFileUrl = workdataFileEntity.getFile();
            URL url = new URL(oldFileUrl);
            String oldKey = url.getPath().substring(1);
            s3Uploader.deleteFile(oldKey);

            // 새로운 파일 업로드
            String newFileUrl = s3Uploader.upload(newFile, "workdata-files");

            // DB 파일 정보 갱신
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
     * 12. 태그 생성
     */
    @PostMapping("/file/tag")
    public ResponseEntity<ResultDTO<SuccessDTO>> addFileTags(
            @RequestParam("wsId") Long wsId,
            @RequestParam("dataNumber") Long dataNumber,
            @RequestBody Map<String, List<String>> requestBody) {
        try {
            // 1. 워크스페이스 검증 (orElseThrow() 제거)
            Optional<WorkspaceEntity> workspaceOpt = workspaceRepository.findById(wsId);
            if (!workspaceOpt.isPresent()) {
                throw new IllegalArgumentException("워크스페이스를 찾을 수 없습니다.");
            }
            WorkspaceEntity workspaceEntity = workspaceOpt.get();

            // 2. 자료글 검증 (orElseThrow() 제거)
            Optional<WorkdataEntity> workdataOpt = workdataRepository.findByDataNumberAndWorkspaceEntity(dataNumber, workspaceEntity);
            if (!workdataOpt.isPresent()) {
                throw new IllegalArgumentException("자료글을 찾을 수 없습니다.");
            }
            WorkdataEntity workdataEntity = workdataOpt.get();

            // 3. 태그 입력 확인
            List<String> tags = requestBody.get("tags");
            if (tags == null || tags.isEmpty()) {
                SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
                ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                        .message("태그가 입력되지 않았지만, 정상적으로 처리되었습니다.")
                        .data(successDTO)
                        .build();
                return ResponseEntity.ok(result);
            }

            // 4. 각 태그에 대해 유효성 검사
            for (String tag : tags) {
                if (tag.matches("^[가-힣]+$")) {
                    if (tag.length() > 3) {
                        throw new IllegalArgumentException("한글 태그는 3글자 이하로 입력해주세요.");
                    }
                } else if (tag.matches("^[a-zA-Z]+$")) {
                    if (tag.length() > 5) {
                        throw new IllegalArgumentException("영어 태그는 5글자 이하로 입력해주세요.");
                    }
                } else {
                    throw new IllegalArgumentException("태그는 한글 또는 영어만 사용 가능합니다.");
                }
            }

            // 5. 현재 태그 개수 확인 (최대 3개 제한)
            int currentTagCount = workdataFileTagRepository.countByWorkdataFileEntity_WorkdataEntity(workdataEntity);
            if (currentTagCount + tags.size() > 3) {
                throw new IllegalArgumentException("이미 태그가 3개 등록되어 더 이상 추가할 수 없습니다.");
            }

            // 6. 자료글에 연결된 파일 중 하나를 찾아 태그 추가 (orElseThrow() 제거)
            Optional<WorkdataFileEntity> firstFileOpt = Optional.ofNullable(workdataFileRepository.findFirstByWorkdataEntity(workdataEntity));
            if (!firstFileOpt.isPresent()) {
                throw new IllegalArgumentException("해당 자료글에 연결된 파일이 없습니다.");
            }
            WorkdataFileEntity firstFileEntity = firstFileOpt.get();

            for (String tag : tags) {
                WorkDataFileTagEntity tagEntity = WorkDataFileTagEntity.builder()
                        .workdataFileEntity(firstFileEntity)
                        .tag(tag)
                        .build();
                workdataFileTagRepository.save(tagEntity);
            }

            // 7. 성공 응답 반환
            SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
            ResultDTO<SuccessDTO> result = ResultDTO.<SuccessDTO>builder()
                    .message("태그 추가에 성공하였습니다.")
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
                    .message("태그 추가에 실패하였습니다: " + e.getMessage())
                    .data(failureDTO)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }






}
