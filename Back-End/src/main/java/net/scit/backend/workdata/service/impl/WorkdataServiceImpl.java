package net.scit.backend.workdata.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
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
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
    private final S3Uploader s3Uploader;
    private final WorkspaceMemberRepository workspaceMemberRepository;


    /**
     * 1-1) 자료글 등록(+ 파일, 태그)
     */
    @Override
    @Transactional
    public WorkdataDTO createWorkdata(WorkdataDTO dto, MultipartFile[] files, List<String> tags, WorkspaceMemberEntity wsMember) {
        // 게시글 생성 및 저장
        WorkdataEntity workdataEntity = createWorkdataAndReturnEntity(dto, wsMember);
        workdataRepository.flush();

        // 파일 저장
        if (files != null && files.length > 0) {
            int existingFileCount = workdataFileRepository.countByWorkdataEntity(workdataEntity);
            if (existingFileCount + files.length > 10) {
                throw new IllegalArgumentException("최대 10개의 파일만 업로드할 수 있습니다.");
            }

            for (MultipartFile file : files) {
                try {
                    String fileUrl = s3Uploader.upload(file, "workdata-files");

                    WorkdataFileEntity fileEntity = WorkdataFileEntity.builder()
                            .workdataEntity(workdataEntity)
                            .file(fileUrl)
                            .fileName(file.getOriginalFilename())
                            .build();

                    workdataFileRepository.save(fileEntity);

                    if (workdataEntity.getWorkdataFile() == null) {
                        workdataEntity.setWorkdataFile(new HashSet<>());
                    }
                    workdataEntity.getWorkdataFile().add(fileEntity);

                } catch (IOException e) {
                    log.error("파일 업로드 중 오류 발생: {}", file.getOriginalFilename(), e);
                    throw new RuntimeException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage());
                }
            }
        }

        // 태그 저장 (WorkdataEntity와 직접 연결)
        if (tags != null && !tags.isEmpty()) {
            for (String tag : tags) {
                if (tag.matches("^[가-힣]+$") && tag.length() > 3) {
                    throw new IllegalArgumentException("한글 태그는 3글자 이하로 입력해주세요.");
                } else if (tag.matches("^[a-zA-Z]+$") && tag.length() > 5) {
                    throw new IllegalArgumentException("영어 태그는 5글자 이하로 입력해주세요.");
                } else if (!tag.matches("^[가-힣a-zA-Z]+$")) {
                    throw new IllegalArgumentException("태그는 한글 또는 영어만 사용 가능합니다.");
                }

                WorkDataFileTagEntity tagEntity = WorkDataFileTagEntity.builder()
                        .workdataEntity(workdataEntity)
                        .tag(tag)
                        .build();

                workdataFileTagRepository.save(tagEntity);

                if (workdataEntity.getWorkdataFileTag() == null) {
                    workdataEntity.setWorkdataFileTag(new HashSet<>());
                }
                workdataEntity.getWorkdataFileTag().add(tagEntity);
            }
        }

        // 최신 상태의 엔티티 재조회
        workdataEntity = workdataRepository.findById(workdataEntity.getDataNumber())
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // DTO 변환 후 반환
        return WorkdataDTO.toDTO(workdataEntity, wsMember);
    }

    /**
     * 게시글 등록 후 엔티티 반환
     */
    @Override
    @Transactional
    public WorkdataEntity createWorkdataAndReturnEntity(WorkdataDTO dto, WorkspaceMemberEntity wsMember) {
        WorkdataEntity workdataEntity = WorkdataEntity.builder()
                .workspaceMember(wsMember)
                .writer(dto.getWriter())
                .title(dto.getTitle())
                .content(dto.getContent())
                .regDate(LocalDateTime.now())
                .build();

        return workdataRepository.save(workdataEntity);
    }


    /**
     * 1-2)자료글 삭제(+ 파일, 태그)
     * @param wsId
     * @param dataNumber
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> deleteWorkdata(Long wsId, Long dataNumber) {
        String email = AuthUtil.getLoginUserId();

        // 1. 해당 워크스페이스에 사용자가 속해 있는지 검증
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 2. 자료글(WorkdataEntity) 조회
        WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 3. 작성자와 로그인한 사용자가 일치하는지 확인
        if (!workdataEntity.getWriter().equals(email)) {
            throw new IllegalArgumentException("본인만 삭제할 수 있습니다.");
        }

        // 4. 자료글 삭제
        // WorkdataEntity의 Cascade 설정(@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true))에 따라
        // 관련 파일(WorkdataFileEntity)과 태그(WorkDataFileTagEntity)도 함께 삭제됨
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
    public ResultDTO<SuccessDTO> updateWorkdata(Long wsId,
                                                Long dataNumber,
                                                String title, String content,
                                                List<String> deleteFiles,
                                                List<String> deleteTags,
                                                List<String> newTags,
                                                MultipartFile[] newFiles) {

        String userEmail = AuthUtil.getLoginUserId();

        // 1. 워크스페이스 검증
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 2. 자료글(WorkdataEntity) 조회
        WorkdataEntity existingEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // ✅ workspaceMember가 변경되지 않도록 유지
        WorkspaceMemberEntity existingWorkspaceMember = existingEntity.getWorkspaceMember();
        log.info("Before update - workspaceMember: {}", existingWorkspaceMember.getMWsNumber());

        // 3. 작성자 검증
        if (!existingEntity.getWriter().equals(userEmail)) {
            throw new IllegalArgumentException("본인만 수정할 수 있습니다.");
        }

        // 4. 파일 삭제 처리 (S3 삭제 + DB 삭제)
        if (deleteFiles != null && !deleteFiles.isEmpty()) {
            List<WorkdataFileEntity> filesToDelete = workdataFileRepository.findByFileNameInAndWorkdataEntity(deleteFiles, existingEntity);
            filesToDelete.forEach(fileEntity -> {
                try {
                    s3Uploader.deleteFile(new URL(fileEntity.getFile()).getPath().substring(1));
                } catch (MalformedURLException e) {
                    log.error("잘못된 파일 URL: {}", fileEntity.getFile(), e);
                    throw new RuntimeException("파일 삭제 중 오류 발생: 잘못된 URL 형식입니다.");
                }
            });
            workdataFileRepository.deleteAll(filesToDelete);
        }

        // 5. 태그 삭제 및 추가 처리 (WorkdataEntity와 직접 연결)
        Set<String> existingTags = workdataFileTagRepository.findByWorkdataEntity(existingEntity)
                .stream().map(WorkDataFileTagEntity::getTag)
                .collect(Collectors.toSet());

        if (deleteTags != null && !deleteTags.isEmpty()) {
            List<WorkDataFileTagEntity> tagsToRemove = workdataFileTagRepository.findByTagInAndWorkdataEntity(deleteTags, existingEntity);
            workdataFileTagRepository.deleteAll(tagsToRemove);
        }

        if (newTags != null && !newTags.isEmpty()) {
            newTags.removeAll(existingTags); // ✅ 중복 태그 방지
            List<WorkDataFileTagEntity> newTagEntities = newTags.stream()
                    .map(tag -> WorkDataFileTagEntity.builder()
                            .workdataEntity(existingEntity)
                            .tag(tag)
                            .build())
                    .collect(Collectors.toList());
            workdataFileTagRepository.saveAll(newTagEntities);
        }

        // 6. 새 파일 업로드 처리 (중복 파일 업로드 방지)
        if (newFiles != null && newFiles.length > 0) {
            Set<String> existingFileNames = workdataFileRepository.findByWorkdataEntity(existingEntity)
                    .stream()
                    .map(WorkdataFileEntity::getFileName)
                    .collect(Collectors.toSet());

            List<WorkdataFileEntity> newFileEntities = Arrays.stream(newFiles)
                    .filter(file -> file != null && file.getSize() > 0) // ✅ null 파일 및 빈 파일 방지
                    .filter(file -> !existingFileNames.contains(file.getOriginalFilename())) // ✅ 중복 파일 방지
                    .map(file -> {
                        try {
                            String fileUrl = s3Uploader.upload(file, "workdata-files");
                            return WorkdataFileEntity.builder()
                                    .workdataEntity(existingEntity)
                                    .file(fileUrl)
                                    .fileName(file.getOriginalFilename())
                                    .build();
                        } catch (IOException e) {
                            log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
                            throw new RuntimeException("파일 업로드 중 오류 발생: " + file.getOriginalFilename(), e);
                        }
                    }).collect(Collectors.toList());

            if (!newFileEntities.isEmpty()) {
                workdataFileRepository.saveAll(newFileEntities);
            } else {
                log.info("유효한 새 파일이 없어 저장하지 않았습니다.");
            }
        }

        // 7. 자료글 제목 및 내용 수정
        existingEntity.setTitle(title != null ? title : existingEntity.getTitle());
        existingEntity.setContent(content != null ? content : existingEntity.getContent());

        // ✅ workspaceMember가 변경되지 않도록 유지
        existingEntity.setWorkspaceMember(existingWorkspaceMember);

        workdataRepository.save(existingEntity);
        log.info("After update - workspaceMember: {}", existingEntity.getWorkspaceMember().getMWsNumber());

        return ResultDTO.of("자료글 수정 완료!", SuccessDTO.builder().success(true).build());
    }


    /**
     * 1-4.1) 자료글 전체 조회(+정렬)
     *
     * @return
     */
    @Override
    @Transactional
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(Long wsId, String sort, String order) {
        String userEmail = AuthUtil.getLoginUserId();

        // 워크스페이스 멤버 검증
        WorkspaceMemberEntity wsMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // WorkdataEntity 목록 조회 (files와 태그는 Eager 또는 fetch join으로 미리 로딩)
        List<WorkdataEntity> workdataEntities = Optional.ofNullable(workdataRepository.findWithFilesAndTags(wsId))
                .orElse(Collections.emptyList());

        List<WorkdataTotalSearchDTO> responseDTOs = workdataEntities.stream()
                .map(entity -> {
                    WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.toWorkdataTotalSearchDTO(entity, wsMember);
                    // 파일 이름 목록
                    dto.setFileNames(entity.getWorkdataFile().stream()
                            .map(WorkdataFileEntity::getFileName)
                            .distinct()
                            .collect(Collectors.toList()));
                    // 파일 URL 목록
                    dto.setFileUrls(entity.getWorkdataFile().stream()
                            .map(WorkdataFileEntity::getFile)
                            .distinct()
                            .collect(Collectors.toList()));
                    // 태그 목록 - 변경된 구조에 따라 WorkdataEntity의 직접 자식인 workdataFileTag를 사용
                    dto.setTags(entity.getWorkdataFileTag().stream()
                            .map(WorkDataFileTagEntity::getTag)
                            .distinct()
                            .collect(Collectors.toList()));

                    return dto;
                }).collect(Collectors.toList());

        // 정렬 적용
        Comparator<WorkdataTotalSearchDTO> comparator = switch (sort) {
            case "writer" -> Comparator.comparing(WorkdataTotalSearchDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
            case "title"  -> Comparator.comparing(WorkdataTotalSearchDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
            default       -> Comparator.comparing(WorkdataTotalSearchDTO::getRegDate);
        };

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }

        responseDTOs.sort(comparator);

        return ResponseEntity.ok(ResultDTO.of("자료글 전체 조회 성공!", responseDTOs));
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
        String userEmail = AuthUtil.getLoginUserId();

        // 워크스페이스 멤버 검증
        WorkspaceMemberEntity wsMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 자료글 조회 (※ 기존 Repository 메서드명이 관계 변경에 맞게 수정되어야 함)
        WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspaceEntity_WsId(dataNumber, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 자료글을 찾을 수 없습니다."));

        // DTO 변환
        WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.toWorkdataTotalSearchDTO(workdataEntity, wsMember);

        // 파일 정보 설정
        dto.setFileNames(workdataEntity.getWorkdataFile().stream()
                .map(WorkdataFileEntity::getFileName)
                .distinct()
                .collect(Collectors.toList()));

        dto.setFileUrls(workdataEntity.getWorkdataFile().stream()
                .map(WorkdataFileEntity::getFile)
                .distinct()
                .collect(Collectors.toList()));

        // 기존에는 WorkdataFileEntity의 태그를 조회하던 부분이었으나,
        // 변경된 관계에서는 WorkdataEntity가 직접 WorkDataFileTagEntity를 자식으로 가지므로 아래와 같이 수정함.
        dto.setTags(workdataEntity.getWorkdataFileTag().stream()
                .map(WorkDataFileTagEntity::getTag)
                .distinct()
                .collect(Collectors.toList()));

        return ResponseEntity.ok(ResultDTO.of("자료글 개별 조회 성공!", dto));
    }


    /**
     * 2. 검색 기능(workdata의 writer, title)
     * @param wsId
     * @param keyword
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<List<WorkdataTotalSearchDTO>> searchWorkdata(Long wsId, String keyword, String sort, String order) {
        String userEmail = AuthUtil.getLoginUserId();

        // 1. 사용자의 워크스페이스 멤버 정보 조회
        WorkspaceMemberEntity wsMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 2. 검색 실행: writer, title, fileName, tag에 keyword가 포함된 자료글 조회
        List<WorkdataEntity> entities = workdataRepository.searchByWorkspaceAndKeyword(wsId, keyword);

        // 3. 검색 결과 없을 경우 빈 리스트 반환
        if (entities.isEmpty()) {
            return ResultDTO.of("검색된 게시물이 없습니다.", List.of());
        }

        // 4. 검색 결과를 WorkdataTotalSearchDTO로 변환
        List<WorkdataTotalSearchDTO> dtos = entities.stream()
                .map(entity -> {
                    WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.toWorkdataTotalSearchDTO(entity, wsMember);

                    // 파일 정보 변환 (파일 이름, URL은 WorkdataFileEntity에서 조회)
                    dto.setFileNames(entity.getWorkdataFile().stream()
                            .map(WorkdataFileEntity::getFileName)
                            .distinct()
                            .collect(Collectors.toList()));

                    dto.setFileUrls(entity.getWorkdataFile().stream()
                            .map(WorkdataFileEntity::getFile)
                            .distinct()
                            .collect(Collectors.toList()));

                    // 태그 변환 - 변경된 구조에서는 WorkdataEntity의 workdataFileTag 컬렉션을 직접 사용
                    dto.setTags(entity.getWorkdataFileTag().stream()
                            .map(WorkDataFileTagEntity::getTag)
                            .distinct()
                            .collect(Collectors.toList()));

                    return dto;
                })
                .collect(Collectors.toList());

        // 5. 정렬 적용
        Comparator<WorkdataTotalSearchDTO> comparator = switch (sort) {
            case "writer" -> Comparator.comparing(WorkdataTotalSearchDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
            case "title"  -> Comparator.comparing(WorkdataTotalSearchDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
            default       -> Comparator.comparing(WorkdataTotalSearchDTO::getRegDate);
        };

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }

        dtos.sort(comparator);

        return ResultDTO.of("검색 결과 조회에 성공했습니다.", dtos);
    }
}
