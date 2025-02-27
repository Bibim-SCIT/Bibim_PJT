package net.scit.backend.workdata.service.impl;

import jakarta.transaction.Transactional;
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
import net.scit.backend.workspace.repository.WorkspaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
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

    /**
     * 1-3)자료글 수정(+ 파일, 태그)
     * @param wsId
     * @param dataNumber
     * @param title
     * @param content
     * @param deleteFiles
     * @param newTags
     * @param newFiles
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> updateWorkdata(
            Long wsId,
            Long dataNumber,
            String title,
            String content,
            List<String> deleteFiles,
            List<String> newTags,
            MultipartFile[] newFiles
    ) {
        // JWT 토큰을 통해 사용자 이메일 조회
        String userEmail = AuthUtil.getLoginUserId();

        // 1. Workspace 및 Workdata 조회
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
        WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspaceEntity(dataNumber, workspaceEntity)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 2. 작성자 검증
        if (!workdataEntity.getWriter().equals(userEmail)) {
            throw new IllegalArgumentException("본인만 수정할 수 있습니다.");
        }
        log.info("수정 전 자료글: {}", workdataEntity);

        // 3. 파일 삭제 처리
        if (deleteFiles != null && !deleteFiles.isEmpty()) {
            // (A) 삭제할 파일 중 태그가 연결된 파일이 있다면 태그 재할당
            reassignTagsIfNeeded(workdataEntity, deleteFiles);

            // (B) 삭제할 파일 엔티티 조회
            List<WorkdataFileEntity> filesToDelete = workdataFileRepository.findByFileNameInAndWorkdataEntity(deleteFiles, workdataEntity);
            for (WorkdataFileEntity fileEntity : filesToDelete) {
                try {
                    URL fileUrl = new URL(fileEntity.getFile());
                    String key = fileUrl.getPath().substring(1);
                    s3Uploader.deleteFile(key);
                } catch (MalformedURLException e) {
                    log.error("잘못된 파일 URL: {}", fileEntity.getFile(), e);
                    throw new RuntimeException("파일 삭제 중 오류 발생: 잘못된 URL 형식입니다.");
                }
                // 부모 WorkdataEntity의 컬렉션에서 삭제
                workdataEntity.getWorkdataFile().remove(fileEntity);
            }
            // (C) 삭제할 파일에 연결된 태그 처리: 부모 컬렉션에서도 제거 후 DB 삭제
            for (WorkdataFileEntity fileEntity : filesToDelete) {
                List<WorkDataFileTagEntity> tags = workdataFileTagRepository.findByWorkdataFileEntity(fileEntity);
                if (tags != null && !tags.isEmpty()) {
                    for (WorkDataFileTagEntity tag : tags) {
                        tag.getWorkdataFileEntity().getWorkdataFileTag().remove(tag);
                    }
                    workdataFileTagRepository.deleteAll(tags);
                }
            }
            workdataFileRepository.deleteAll(filesToDelete);
        }

        // 4. 태그 추가 및 삭제 처리 (기존 태그와 newTags 비교)
        manageTags(workdataEntity, newTags);

        // 5. 새 파일 업로드 처리
        if (newFiles != null && newFiles.length > 0) {
            List<WorkdataFileEntity> newFileEntities = new ArrayList<>();
            for (MultipartFile file : newFiles) {
                try {
                    String fileUrl = s3Uploader.upload(file, "workdata-files");
                    WorkdataFileEntity newFileEntity = WorkdataFileEntity.builder()
                            .workdataEntity(workdataEntity)
                            .file(fileUrl)
                            .fileName(file.getOriginalFilename())
                            .build();
                    newFileEntities.add(newFileEntity);
                    // 부모 컬렉션에 추가
                    workdataEntity.getWorkdataFile().add(newFileEntity);
                } catch (IOException e) {
                    log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
                    throw new RuntimeException("파일 업로드 중 오류 발생: " + file.getOriginalFilename(), e);
                }
            }
            workdataFileRepository.saveAll(newFileEntities);
        }

        // 6. 자료글 제목 및 내용 수정
        if (title != null) {
            workdataEntity.setTitle(title);
        }
        if (content != null) {
            workdataEntity.setContent(content);
        }
        workdataRepository.save(workdataEntity);

        log.info("수정 완료 자료글: {}", workdataEntity);
        return ResultDTO.of("자료글 수정 완료!", SuccessDTO.builder().success(true).build());
    }

    /**
     * 삭제할 파일 목록(deleteFiles)에 태그가 연결된 파일(첫 번째 파일)이 포함되어 있으면,
     * 해당 태그들을 삭제되지 않는 다른 파일로 재할당하여, 삭제 후 태그의 workdataFileEntity가 null이 되는 문제를 방지합니다.
     */
    private void reassignTagsIfNeeded(WorkdataEntity workdataEntity, List<String> deleteFiles) {
        Optional<WorkdataFileEntity> taggedFileOpt = workdataFileRepository.findFirstByWorkdataEntity(workdataEntity);
        if (taggedFileOpt.isPresent()) {
            WorkdataFileEntity taggedFile = taggedFileOpt.get();
            if (deleteFiles.contains(taggedFile.getFileName())) {
                Optional<WorkdataFileEntity> otherFileOpt = workdataEntity.getWorkdataFile().stream()
                        .filter(file -> !deleteFiles.contains(file.getFileName()))
                        .findFirst();
                if (otherFileOpt.isPresent()) {
                    WorkdataFileEntity newTagFile = otherFileOpt.get();
                    // 재할당: 태그들의 부모를 새 파일로 변경
                    for (WorkDataFileTagEntity tagEntity : taggedFile.getWorkdataFileTag()) {
                        tagEntity.setWorkdataFileEntity(newTagFile);
                        // 새 파일의 컬렉션에도 추가
                        newTagFile.getWorkdataFileTag().add(tagEntity);
                    }
                    workdataFileTagRepository.saveAll(taggedFile.getWorkdataFileTag());
                    log.info("태그를 파일 '{}'로 재할당하였습니다.", newTagFile.getFileName());
                } else {
                    throw new IllegalStateException("태그를 유지하려면 최소한 하나의 파일이 남아있어야 합니다.");
                }
            }
        }
    }

    /**
     * 기존 태그와 새 태그(newTags)를 비교하여 삭제할 태그와 추가할 태그를 관리합니다.
     */
    private void manageTags(WorkdataEntity workdataEntity, List<String> newTags) {
        List<WorkDataFileTagEntity> existingTags = workdataFileTagRepository.findByWorkdataFileEntity_WorkdataEntity(workdataEntity);
        Set<String> existingTagSet = existingTags.stream()
                .map(WorkDataFileTagEntity::getTag)
                .collect(Collectors.toSet());
        log.info("DB 기존 태그: {}", existingTagSet);
        log.info("클라이언트 요청 태그(newTags): {}", newTags);

        // 삭제할 태그: 기존에 있으나 newTags에 없는 태그
        Set<String> tagsToDelete = new HashSet<>(existingTagSet);
        tagsToDelete.removeAll(newTags);
        log.info("삭제할 태그: {}", tagsToDelete);

        // 추가할 태그: newTags에 있으나 기존에 없는 태그
        Set<String> tagsToAdd = new HashSet<>(newTags);
        tagsToAdd.removeAll(existingTagSet);
        log.info("추가할 태그: {}", tagsToAdd);

        if (!tagsToDelete.isEmpty()) {
            List<WorkDataFileTagEntity> tagsToRemove = workdataFileTagRepository.findByTagInAndWorkdataFileEntity_WorkdataEntity(
                    new ArrayList<>(tagsToDelete), workdataEntity);
            for (WorkDataFileTagEntity tagEntity : tagsToRemove) {
                tagEntity.getWorkdataFileEntity().getWorkdataFileTag().remove(tagEntity);
            }
            workdataFileTagRepository.deleteAll(tagsToRemove);
        }

        if (!tagsToAdd.isEmpty()) {
            Optional<WorkdataFileEntity> optionalFileEntity = workdataFileRepository.findFirstByWorkdataEntity(workdataEntity);
            if (optionalFileEntity.isEmpty()) {
                log.warn("자료글에 연결된 파일이 없어 태그를 추가할 수 없습니다. 새 파일을 먼저 업로드하세요.");
                throw new IllegalStateException("자료글에 연결된 파일이 없어 태그를 추가할 수 없습니다.");
            }
            WorkdataFileEntity firstFileEntity = optionalFileEntity.get();
            List<WorkDataFileTagEntity> newTagEntities = tagsToAdd.stream()
                    .map(tag -> WorkDataFileTagEntity.builder()
                            .workdataFileEntity(firstFileEntity)
                            .tag(tag)
                            .build())
                    .collect(Collectors.toList());
            // 부모 컬렉션에도 추가
            firstFileEntity.getWorkdataFileTag().addAll(newTagEntities);
            workdataFileTagRepository.saveAll(newTagEntities);
        }
    }


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

            // 파일 이름 리스트 처리 (Set 적용)
            Set<String> fileNames = Optional.ofNullable(entity.getWorkdataFile())
                    .orElse(Collections.emptySet())
                    .stream()
                    .map(WorkdataFileEntity::getFileName)
                    .collect(Collectors.toSet());
            dto.setFileNames(new ArrayList<>(fileNames));

            // 파일 URL 리스트 추가 (파일 다운로드 가능하도록)
            Set<String> fileUrls = Optional.ofNullable(entity.getWorkdataFile())
                    .orElse(Collections.emptySet())
                    .stream()
                    .map(WorkdataFileEntity::getFile) // 파일의 저장 경로(URL)를 가져옴
                    .collect(Collectors.toSet());
            dto.setFileUrls(new ArrayList<>(fileUrls));

            // 태그 처리 (각 파일의 태그를 낱개별로, Set 적용)
            Set<String> tags = Optional.ofNullable(entity.getWorkdataFile())
                    .orElse(Collections.emptySet())
                    .stream()
                    .flatMap(file -> Optional.ofNullable(file.getWorkdataFileTag())
                            .orElse(Collections.emptySet())
                            .stream())
                    .map(WorkDataFileTagEntity::getTag)
                    .collect(Collectors.toSet());
            dto.setTags(new ArrayList<>(tags));

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
                .orElse(Collections.emptySet())
                .stream()
                .map(WorkdataFileEntity::getFileName)
                .collect(Collectors.toSet());
        dto.setFileNames(new ArrayList<>(fileNames)); // DTO에는 List로 저장

        // 4. 파일 URL 리스트 변환 (다운로드 가능)
        Set<String> fileUrls = Optional.ofNullable(workdataEntity.getWorkdataFile())
                .orElse(Collections.emptySet())
                .stream()
                .map(WorkdataFileEntity::getFile) // ✅ 파일 URL 추가
                .collect(Collectors.toSet());
        dto.setFileUrls(new ArrayList<>(fileUrls)); // DTO에 추가

        // 5. 태그 리스트 변환 (Set 적용)
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
