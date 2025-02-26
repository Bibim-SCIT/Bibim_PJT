package net.scit.backend.workdata.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
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
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkdataServiceImpl implements WorkdataService {

    private final WorkdataRepository workdataRepository;
    private final WorkdataFileRepository workdataFileRepository;
    private final WorkdataFileTagRepository workdataFileTagRepository;
    private final WorkspaceRepository workspaceRepository;
    private final S3Uploader s3Uploader;
    private final ObjectMapper objectMapper;
    private final WorkspaceMemberRepository workspaceMemberRepository;





    /**
     * 1-1) 자료글 등록(+ 파일, 태그)
     */
    @Override
    @Transactional
    public WorkdataEntity createWorkdataAndReturnEntity(Long wsId, WorkdataDTO dto) {
        // 1. WorkspaceEntity 찾기
        WorkspaceEntity ws = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 워크스페이스가 존재하지 않습니다. wsId=" + wsId));

        // 2. WorkdataEntity 생성 (dto + ws)
        WorkdataEntity entity = WorkdataEntity.toEntity(dto, ws);

        // 3. 자료글 저장
        workdataRepository.save(entity);

        // 4. 생성된 WorkdataEntity 반환
        return entity;
    }

    @Override
    @Transactional
    public void createWorkdata(Long wsId, WorkdataDTO dto, MultipartFile[] files, List<String> tags) {
        // 1. 자료글 생성
        WorkdataEntity workdataEntity = createWorkdataAndReturnEntity(wsId, dto);

        // 2. 파일 업로드 (파일이 존재하는 경우)
        if (files != null && files.length > 0) {
            int existingFileCount = workdataFileRepository.countByWorkdataEntity(workdataEntity);
            if (existingFileCount + files.length > 10) {
                throw new IllegalArgumentException("최대 10개의 파일만 업로드할 수 있습니다.");
            }
            for (MultipartFile file : files) {
                try {
                    // S3에 업로드
                    String fileUrl = s3Uploader.upload(file, "workdata-files");

                    // WorkdataFileEntity 생성 & 저장
                    WorkdataFileEntity workdataFileEntity = WorkdataFileEntity.builder()
                            .workdataEntity(workdataEntity)
                            .file(fileUrl)
                            .fileName(file.getOriginalFilename())
                            .build();
                    workdataFileRepository.save(workdataFileEntity);

                } catch (IOException e) {
                    log.error("파일 업로드 중 오류 발생: {}", file.getOriginalFilename(), e);
                    throw new RuntimeException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage());
                }
            }
        }

        // 3. 태그 추가 (태그가 존재하는 경우)
        if (tags != null && !tags.isEmpty()) {
            int currentTagCount = workdataFileTagRepository.countByWorkdataFileEntity_WorkdataEntity(workdataEntity);
            if (currentTagCount + tags.size() > 3) {
                throw new IllegalArgumentException("이미 태그가 3개 등록되어 더 이상 추가할 수 없습니다.");
            }

            // 파일 중 하나를 찾아 태그 추가 (없을 경우 예외 발생)
            WorkdataFileEntity firstFileEntity = workdataFileRepository.findFirstByWorkdataEntity(workdataEntity)
                    .orElseThrow(() -> new IllegalArgumentException("해당 자료글에 연결된 파일이 없습니다."));

            for (String tag : tags) {
                if (tag.matches("^[가-힣]+$") && tag.length() > 3) {
                    throw new IllegalArgumentException("한글 태그는 3글자 이하로 입력해주세요.");
                } else if (tag.matches("^[a-zA-Z]+$") && tag.length() > 5) {
                    throw new IllegalArgumentException("영어 태그는 5글자 이하로 입력해주세요.");
                } else if (!tag.matches("^[가-힣a-zA-Z]+$")) {
                    throw new IllegalArgumentException("태그는 한글 또는 영어만 사용 가능합니다.");
                }

                WorkDataFileTagEntity tagEntity = WorkDataFileTagEntity.builder()
                        .workdataFileEntity(firstFileEntity) // ✅ Optional 해결
                        .tag(tag)
                        .build();
                workdataFileTagRepository.save(tagEntity);
            }
        }
    }


    /**
     * 1-2)자료글 삭제(+ 파일, 태그)
     * @param wsId
     * @param dataNumber
     * @param email
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> deleteWorkdata(Long wsId, Long dataNumber, String email) {
        // 1. 워크스페이스 조회 (wsId 기반)
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));

        // 2. 자료글 조회 (워크스페이스와 dataNumber로 조회)
        WorkdataEntity workdataEntity = workdataRepository
                .findByDataNumberAndWorkspaceEntity(dataNumber, workspaceEntity)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 3. 작성자와 현재 로그인 사용자가 일치하는지 확인
        if (!workdataEntity.getWriter().equals(email)) {
            throw new IllegalArgumentException("본인만 삭제할 수 있습니다.");
        }

        // 4. 자료글 삭제 (Cascade 설정에 따라 파일, 태그도 함께 삭제)
        workdataRepository.delete(workdataEntity);

        // 5. 성공 응답 반환
        SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
        return ResultDTO.of("자료글 및 관련 파일/태그 삭제(컬럼 Cascade)에 성공하였습니다.", successDTO);
    }

//    /**
//     * 1-3)자료글 수정(+ 파일, 태그)
//     * @param wsId
//     * @param dataNumber
//     * @param title
//     * @param content
//     * @param deleteFiles
//     * @param newTags
//     * @param newFiles
//     * @return
//     */
//    @Override
//    @Transactional
//    public ResultDTO<SuccessDTO> updateWorkdata(
//            Long wsId,
//            Long dataNumber,
//            String title,
//            String content,
//            List<String> deleteFiles,
//            List<String> oldTags,   // 기존 태그
//            List<String> newTags,   // 새 태그
//            MultipartFile[] newFiles,
//            String userEmail
//    ) {
//        // 1. Workspace & Workdata 조회
//        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
//                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
//        WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspaceEntity(dataNumber, workspaceEntity)
//                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));
//
//        // 2. 작성자 검증
//        if (!workdataEntity.getWriter().equals(userEmail)) {
//            throw new IllegalArgumentException("본인만 수정할 수 있습니다.");
//        }
//
//        log.info("수정 전 자료글: {}", workdataEntity);
//
//        // 3. 파일 삭제 처리
//        if (deleteFiles != null && !deleteFiles.isEmpty()) {
//            List<WorkdataFileEntity> filesToDelete = workdataFileRepository.findByFileNameInAndWorkdataEntity(deleteFiles, workdataEntity);
//            for (WorkdataFileEntity fileEntity : filesToDelete) {
//                try {
//                    URL fileUrl = new URL(fileEntity.getFile());
//                    String key = fileUrl.getPath().substring(1);
//                    s3Uploader.deleteFile(key);
//                } catch (MalformedURLException e) {
//                    log.error("잘못된 파일 URL: {}", fileEntity.getFile(), e);
//                    throw new RuntimeException("파일 삭제 중 오류 발생: 잘못된 URL 형식입니다.");
//                }
//            }
//            workdataFileRepository.deleteAll(filesToDelete);
//        }
//
//        // 4. 태그 처리
//        List<WorkDataFileTagEntity> existingTags = workdataFileTagRepository.findByWorkdataFileEntity_WorkdataEntity(workdataEntity);
//
//        // 기존 태그와 새로운 태그 비교하여 삭제 및 추가 처리
//        Set<String> existingTagSet = existingTags.stream().map(WorkDataFileTagEntity::getTag).collect(Collectors.toSet());
//        Set<String> newTagSet = new HashSet<>(newTags);
//
//        // 삭제할 태그 (기존에 있는데 새 태그에 없는 것)
//        List<WorkDataFileTagEntity> tagsToDelete = existingTags.stream()
//                .filter(tag -> !newTagSet.contains(tag.getTag()))
//                .collect(Collectors.toList());
//
//        // 추가할 태그 (새 태그에 있는데 기존에 없는 것)
//        List<String> tagsToAdd = newTags.stream()
//                .filter(tag -> !existingTagSet.contains(tag))
//                .collect(Collectors.toList());
//
//        log.info("기존 태그: {}", existingTagSet);
//        log.info("새 태그: {}", newTagSet);
//        log.info("삭제할 태그: {}", tagsToDelete.stream().map(WorkDataFileTagEntity::getTag).collect(Collectors.toList()));
//        log.info("추가할 태그: {}", tagsToAdd);
//
//        // 태그 삭제
//        if (!tagsToDelete.isEmpty()) {
//            workdataFileTagRepository.deleteAll(tagsToDelete);
//        }
//
//        // 태그 추가 (최대 3개 제한 유지)
//        if (!tagsToAdd.isEmpty()) {
//            List<WorkdataFileEntity> fileEntities = workdataFileRepository.findByWorkdataEntity(workdataEntity);
//            if (fileEntities.isEmpty()) {
//                throw new IllegalArgumentException("자료글에 연결된 파일이 없어 태그를 추가할 수 없습니다.");
//            }
//
//            // 첫 번째 파일에 태그 추가
//            WorkdataFileEntity firstFileEntity = fileEntities.get(0);
//            List<WorkDataFileTagEntity> newTagEntities = tagsToAdd.stream()
//                    .map(tag -> WorkDataFileTagEntity.builder()
//                            .workdataFileEntity(firstFileEntity)
//                            .tag(tag)
//                            .build())
//                    .collect(Collectors.toList());
//
//            // 태그 개수 검증
//            if (existingTags.size() + newTagEntities.size() > 3) {
//                throw new IllegalArgumentException("태그는 최대 3개까지만 등록할 수 있습니다.");
//            }
//
//            workdataFileTagRepository.saveAll(newTagEntities);
//        }
//
//        // 5. 새 파일 업로드 처리
//        if (newFiles != null && newFiles.length > 0) {
//            List<WorkdataFileEntity> existingFiles = workdataFileRepository.findByWorkdataEntity(workdataEntity);
//            int totalFiles = existingFiles.size() + newFiles.length;
//            if (totalFiles > 10) {
//                throw new IllegalArgumentException("최대 10개의 파일만 업로드할 수 있습니다.");
//            }
//
//            List<WorkdataFileEntity> newFileEntities = new ArrayList<>();
//            for (MultipartFile file : newFiles) {
//                try {
//                    String fileUrl = s3Uploader.upload(file, "workdata-files");
//                    newFileEntities.add(WorkdataFileEntity.builder()
//                            .workdataEntity(workdataEntity)
//                            .file(fileUrl)
//                            .fileName(file.getOriginalFilename())
//                            .build());
//                } catch (IOException e) {
//                    log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
//                    throw new RuntimeException("파일 업로드 중 오류 발생: " + file.getOriginalFilename(), e);
//                }
//            }
//            workdataFileRepository.saveAll(newFileEntities);
//        }
//
//        // 6. 자료글 제목 및 내용 수정
//        if (title != null) {
//            workdataEntity.setTitle(title);
//        }
//        if (content != null) {
//            workdataEntity.setContent(content);
//        }
//        workdataRepository.save(workdataEntity);
//
//        log.info("수정 완료 자료글: {}", workdataEntity);
//        return ResultDTO.of("자료글 수정 완료!", SuccessDTO.builder().success(true).build());
//    }




    /**
     * 1-4.1) 자료글 전체 조회(+정렬)
     *
     * @return
     */
    @Override
    @Transactional
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(Long wsId, String sort, String order) {
        // 특정 워크스페이스에 속한 자료 조회 (파일과 태그 포함)
        List<WorkdataEntity> workdataEntities = workdataRepository.findWithFilesAndTags(wsId);

        // 데이터 가공 및 변환
        List<WorkdataTotalSearchDTO> responseDTOs = workdataEntities.stream().map(entity -> {
            WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.toWorkdataTotalSearchDTO(entity);

            // 📌 파일 이름 리스트 처리 (Set 적용)
            Set<String> fileNames = Optional.ofNullable(entity.getWorkdataFile())
                    .orElse(Collections.emptySet())  // Set으로 변경
                    .stream()
                    .map(WorkdataFileEntity::getFileName)

                    .collect(Collectors.toSet()); // Set으로 변환
            dto.setFileNames(new ArrayList<>(fileNames)); // DTO에는 List로 저장

            // 📌 태그 처리 (각 파일의 태그를 낱개별로, Set 적용)
            Set<String> tags = Optional.ofNullable(entity.getWorkdataFile())
                    .orElse(Collections.emptySet()) // Set으로 변경
                    .stream()
                    .flatMap(file -> Optional.ofNullable(file.getWorkdataFileTag())
                            .orElse(Collections.emptySet()) // Set으로 변경
                            .stream())
                    .map(WorkDataFileTagEntity::getTag)
                    .collect(Collectors.toSet()); // Set으로 변환
            dto.setTags(new ArrayList<>(tags)); // DTO에는 List로 저장

            return dto;
        }).collect(Collectors.toList());

        // 정렬 적용
        Comparator<WorkdataTotalSearchDTO> comparator;
        switch (sort) {
            case "writer":
                comparator = Comparator.comparing(WorkdataTotalSearchDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
                break;
            case "title":
                comparator = Comparator.comparing(WorkdataTotalSearchDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
                break;
            case "regDate":
            default:
                comparator = Comparator.comparing(WorkdataTotalSearchDTO::getRegDate);
                break;
        }
        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        responseDTOs = responseDTOs.stream().sorted(comparator).collect(Collectors.toList());
        log.info("조회된 자료 수: {}, 정렬 기준: {}, 정렬 방향: {}", responseDTOs.size(), sort, order);

        // ✅ 컨트롤러 반환 형식과 일치하도록 수정된 return 문
        return ResponseEntity.ok(ResultDTO.of("자료글 전체 조회에 성공했습니다.", responseDTOs));
    }




    /**
     * 1-4.2) 자료글 개별 조회
     * @param wsId
     * @param dataNumber
     * @return
     */
    @Override
    @Transactional
    public ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(Long wsId, Long dataNumber) {
        // 1. 자료글 조회 (워크스페이스 ID + 자료 번호)
        WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspaceEntity_WsId(dataNumber, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 자료글을 찾을 수 없습니다."));

        // 2. DTO 변환
        WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.toWorkdataTotalSearchDTO(workdataEntity);

        // 3. 파일 이름 리스트 변환 (Set 적용)
        Set<String> fileNames = Optional.ofNullable(workdataEntity.getWorkdataFile())
                .orElse(Collections.emptySet()) // Set 사용
                .stream()
                .map(WorkdataFileEntity::getFileName)
                .collect(Collectors.toSet());
        dto.setFileNames(new ArrayList<>(fileNames)); // DTO에는 List로 저장

        // 4. 태그 리스트 변환 (Set 적용)
        Set<String> tags = Optional.ofNullable(workdataEntity.getWorkdataFile())
                .orElse(Collections.emptySet())
                .stream()
                .flatMap(file -> Optional.ofNullable(file.getWorkdataFileTag())
                        .orElse(Collections.emptySet())
                        .stream())
                .map(WorkDataFileTagEntity::getTag)
                .collect(Collectors.toSet());
        dto.setTags(new ArrayList<>(tags)); // DTO에는 List로 저장

        return ResponseEntity.ok(ResultDTO.of("자료글 개별 조회에 성공했습니다.", dto));
    }


    /**
     * 2. 검색 기능(workdata의 writer, title)
     * @param wsId
     * @param keyword
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<List<WorkdataDTO>> searchWorkdata(Long wsId, String keyword, String sort, String order) {
        // 1. 워크스페이스 존재 여부 확인
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));

        // 2. 검색: 워크스페이스 내에서 writer, title, fileName, tag에 keyword가 포함된 자료글 조회
        //    workdataRepository.searchByWorkspaceAndKeyword(wsId, keyword) 는 아래와 같이 정의되어 있어야 합니다.
        //    예시:
        //    @Query("SELECT DISTINCT w FROM WorkdataEntity w " +
        //           "LEFT JOIN w.workdataFile f " +
        //           "LEFT JOIN f.workdataFileTag t " +
        //           "WHERE w.workspaceEntity.wsId = :wsId " +
        //           "AND (LOWER(w.writer) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
        //           "OR LOWER(w.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
        //           "OR LOWER(f.fileName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
        //           "OR LOWER(t.tag) LIKE LOWER(CONCAT('%', :keyword, '%')))")
        //    List<WorkdataEntity> searchByWorkspaceAndKeyword(@Param("wsId") Long wsId, @Param("keyword") String keyword);
        List<WorkdataEntity> entities = workdataRepository.searchByWorkspaceAndKeyword(wsId, keyword);

        if (entities.isEmpty()) {
            return ResultDTO.of("게시물이 존재하지 않습니다.", List.of());
        }

        // 3. 검색 결과를 DTO로 변환
        List<WorkdataDTO> dtos = entities.stream()
                .map(WorkdataDTO::toDTO)
                .collect(Collectors.toList());

        // 4. 정렬 적용 (writer, title, regDate 기준)
        Comparator<WorkdataDTO> comparator;
        switch (sort) {
            case "writer":
                comparator = Comparator.comparing(WorkdataDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
                break;
            case "title":
                comparator = Comparator.comparing(WorkdataDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
                break;
            case "regDate":
            default:
                comparator = Comparator.comparing(WorkdataDTO::getRegDate);
                break;
        }
        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        dtos = dtos.stream().sorted(comparator).collect(Collectors.toList());

        return ResultDTO.of("검색 결과 조회에 성공했습니다.", dtos);
    }


}
