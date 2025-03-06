package net.scit.backend.workdata.service.impl;

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
import net.scit.backend.workdata.event.WorkdataCreatedEvent;
import net.scit.backend.workdata.event.WorkdataDeletedEvent;
import net.scit.backend.workdata.event.WorkdataUpdatedEvent;
import net.scit.backend.workdata.repository.WorkdataFileRepository;
import net.scit.backend.workdata.repository.WorkdataFileTagRepository;
import net.scit.backend.workdata.repository.WorkdataRepository;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;


    /**
     * 1. 자료실 등록
     * @param wsId
     * @param title
     * @param content
     * @param files
     * @param tags
     * @return
     */
    @Override
    public WorkdataDTO createWorkdata(Long wsId, String title, String content, MultipartFile[] files, List<String> tags) {
        // 현재 로그인한 사용자의 email 가져오기
        String email = AuthUtil.getLoginUserId();

        // 사용자의 워크스페이스 멤버 검증
        WorkspaceMemberEntity wsMember = (WorkspaceMemberEntity) workspaceMemberRepository
                .findByMember_EmailAndWorkspace_WsId(email, wsId)
                .orElseThrow(() -> new IllegalArgumentException("사용자의 워크스페이스를 찾을 수 없습니다."));

        // WorkdataEntity 생성 (wsId는 wsMember의 workspace에서 가져오기)
        WorkdataEntity workdataEntity = createWorkdataAndReturnEntity(email, title, content, wsMember);
        workdataRepository.flush();

        // 파일 저장 (기존 코드 유지)
        List<WorkdataFileEntity> fileEntities = new ArrayList<>();
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                try {
                    String fileUrl = s3Uploader.upload(file, "workdata-files");
                    WorkdataFileEntity fileEntity = WorkdataFileEntity.builder()
                            .workdataEntity(workdataEntity)
                            .file(fileUrl)
                            .fileName(file.getOriginalFilename())
                            .build();
                    workdataFileRepository.save(fileEntity);
                    fileEntities.add(fileEntity);
                } catch (IOException e) {
                    log.error("파일 업로드 중 오류 발생: {}", file.getOriginalFilename(), e);
                    throw new RuntimeException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage());
                }
            }
        }

        // 태그 저장 (기존 코드 유지)
        List<WorkDataFileTagEntity> tagEntities = new ArrayList<>();
        if (tags != null && !tags.isEmpty()) {
            for (String tag : tags) {
                WorkDataFileTagEntity tagEntity = WorkDataFileTagEntity.builder()
                        .workdataEntity(workdataEntity)
                        .tag(tag)
                        .build();
                workdataFileTagRepository.save(tagEntity);
                tagEntities.add(tagEntity);
            }
        }

        // 최신 데이터 다시 조회
        workdataEntity = workdataRepository.findById(workdataEntity.getDataNumber())
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 자료글 생성 이벤트 (알림 전송)
        eventPublisher.publishEvent(new WorkdataCreatedEvent(workdataEntity, email));

        // DTO 변환하여 반환
        return WorkdataDTO.toDTO(workdataEntity, new HashSet<>(fileEntities), new HashSet<>(tagEntities), wsMember);
    }

    /**
     * 게시글 등록 후 엔티티 반환 (내부적으로만 사용됨)
     */
    private WorkdataEntity createWorkdataAndReturnEntity(String email, String title, String content, WorkspaceMemberEntity wsMember) {
        WorkdataEntity entity = WorkdataEntity.builder()
                .workspaceMember(wsMember)
                .workspace(wsMember.getWorkspace()) // ✅ wsId는 wsMember의 workspace에서 가져오기
                .writer(email)
                .title(title)
                .content(content)
                .regDate(LocalDateTime.now()) // 자동 세팅 가능
                .build();
        return workdataRepository.save(entity);
    }


    /**
     * 1-2)자료글 삭제(+ 파일, 태그)
     * @param wsId
     * @param dataNumber
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> deleteWorkdata(Long wsId, Long dataNumber) {
        // 토큰에서 사용자 이메일 추출 (AuthUtil 사용)
        String email = AuthUtil.getLoginUserId();

        // 해당 사용자가 wsId에 속해 있는지 검증
        workspaceMemberRepository.findByMember_EmailAndWorkspace_WsId(email, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 자료글 조회
        WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 작성자와 로그인 사용자가 일치하는지 확인
        if (!workdataEntity.getWriter().equals(email)) {
            throw new IllegalArgumentException("본인만 삭제할 수 있습니다.");
        }

        // 자료글 삭제 (Cascade 설정 덕분에 파일, 태그 자동 삭제)
        workdataRepository.delete(workdataEntity);

        // 삭제 이벤트 발생 (알림 전송)
        eventPublisher.publishEvent(new WorkdataDeletedEvent(workdataEntity, email));

        // 성공 응답
        SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
        return ResultDTO.of("자료글 및 관련 파일/태그 삭제에 성공하였습니다.", successDTO);
    }


    @Override
    public ResultDTO<SuccessDTO> updateWorkdata(Long wsId,
                                                Long dataNumber,
                                                String title,
                                                String content,
                                                List<String> deleteFiles,
                                                List<String> deleteTags,
                                                List<String> newTags,
                                                MultipartFile[] newFiles) {

        // 1. 현재 로그인한 사용자 이메일 추출 (AuthUtil 사용)
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 해당 사용자가 wsId에 속해 있는지 검증
        workspaceMemberRepository.findByMember_EmailAndWorkspace_WsId(userEmail, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 3. 자료글 조회
        WorkdataEntity existingEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 4. 작성자 검증
        if (!existingEntity.getWriter().equals(userEmail)) {
            throw new IllegalArgumentException("본인만 수정할 수 있습니다.");
        }

        // 기존의 workspaceMember(작성자/워크스페이스) 유지
        WorkspaceMemberEntity existingWorkspaceMember = existingEntity.getWorkspaceMember();

        /* ---------------------------
         *    파일 삭제 처리
         * --------------------------- */
        if (deleteFiles != null && !deleteFiles.isEmpty()) {
            // 1) 삭제할 파일들 조회
            List<WorkdataFileEntity> filesToDelete = workdataFileRepository.findByFileNameInAndWorkdataEntity(deleteFiles, existingEntity);
            // 2) S3 파일 삭제
            filesToDelete.forEach(fileEntity -> {
                try {
                    String fileUrl = fileEntity.getFile(); // full path
                    // S3에서 key 추출 시 경로 처리(예: path.substring(1))
                    s3Uploader.deleteFile(new URL(fileUrl).getPath().substring(1));
                } catch (MalformedURLException e) {
                    log.error("잘못된 파일 URL: {}", fileEntity.getFile(), e);
                    throw new RuntimeException("파일 삭제 중 오류 발생: 잘못된 URL 형식입니다.");
                }
            });
            // 3) DB에서도 삭제
            workdataFileRepository.deleteAll(filesToDelete);
        }

        /* ---------------------------
         *    태그 삭제 / 추가 처리
         * --------------------------- */
        // 현재 등록된 태그 set
        Set<String> existingTags = workdataFileTagRepository.findByWorkdataEntity(existingEntity)
                .stream()
                .map(WorkDataFileTagEntity::getTag)
                .collect(Collectors.toSet());

        // 1) 태그 삭제
        if (deleteTags != null && !deleteTags.isEmpty()) {
            List<WorkDataFileTagEntity> tagsToRemove = workdataFileTagRepository.findByTagInAndWorkdataEntity(deleteTags, existingEntity);
            workdataFileTagRepository.deleteAll(tagsToRemove);
        }

        // 2) 태그 추가 (중복 태그 제거 후 추가)
        if (newTags != null && !newTags.isEmpty()) {
            newTags.removeAll(existingTags);
            List<WorkDataFileTagEntity> newTagEntities = newTags.stream()
                    .map(tag -> WorkDataFileTagEntity.builder()
                            .workdataEntity(existingEntity)
                            .tag(tag)
                            .build())
                    .collect(Collectors.toList());
            if (!newTagEntities.isEmpty()) {
                workdataFileTagRepository.saveAll(newTagEntities);
            }
        }

        /* ---------------------------
         *    새 파일 업로드 처리
         * --------------------------- */
        if (newFiles != null && newFiles.length > 0) {
            // 1) 현재 등록된 파일명 set
            Set<String> existingFileNames = workdataFileRepository.findByWorkdataEntity(existingEntity)
                    .stream()
                    .map(WorkdataFileEntity::getFileName)
                    .collect(Collectors.toSet());
            // 2) 새 파일 업로드 + DB 저장
            List<WorkdataFileEntity> newFileEntities = Arrays.stream(newFiles)
                    .filter(file -> file != null && file.getSize() > 0)
                    .filter(file -> !existingFileNames.contains(file.getOriginalFilename()))
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
                    })
                    .collect(Collectors.toList());
            if (!newFileEntities.isEmpty()) {
                workdataFileRepository.saveAll(newFileEntities);
            }
        }

        /* ---------------------------
         *    자료글 제목 / 내용 수정
         * --------------------------- */
        existingEntity.setTitle(title != null ? title : existingEntity.getTitle());
        existingEntity.setContent(content != null ? content : existingEntity.getContent());

        // 작성자/워크스페이스 변경 방지
        existingEntity.setWorkspaceMember(existingWorkspaceMember);

        // DB에 저장 (즉시 반영을 위해 save)
        workdataRepository.save(existingEntity);

        // 자료글 수정 이벤트 발생 (알림 등)
        eventPublisher.publishEvent(new WorkdataUpdatedEvent(existingEntity, userEmail));

        // 수정 결과 응답
        return ResultDTO.of("자료글 수정 완료!", SuccessDTO.builder().success(true).build());
    }


    /**
     * 1-4.1) 자료글 전체 조회 (+정렬)
     * @param wsId
     * @param sort
     * @param order
     * @return
     */
    @Override
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(Long wsId, String sort, String order) {
        // 1) 로그인한 사용자 이메일 가져오기
        String userEmail = AuthUtil.getLoginUserId();

        // 2) 해당 사용자가 wsId에 속해 있는지 검증 (findByMember_EmailAndWorkspace_WsId 사용)
        WorkspaceMemberEntity wsMember = workspaceMemberRepository
                .findByMember_EmailAndWorkspace_WsId(userEmail, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 3) 자료글 목록 조회 (+ 파일, 태그 미리 로딩)
        List<WorkdataEntity> workdataEntities = Optional.ofNullable(workdataRepository.findWithFilesAndTags(wsId))
                .orElse(Collections.emptyList());

        // 4) DTO 변환 (Set을 List로 변환)
        List<WorkdataTotalSearchDTO> responseDTOs = workdataEntities.stream()
                .map(entity -> WorkdataTotalSearchDTO.toDTO(
                        entity,
                        new ArrayList<>(entity.getWorkdataFiles()),
                        new ArrayList<>(entity.getWorkdataFileTags()),
                        wsMember
                ))
                .collect(Collectors.toList());

        // 5) 정렬 로직 (sort, order)
        Comparator<WorkdataTotalSearchDTO> comparator = switch (sort) {
            case "writer" -> Comparator.comparing(WorkdataTotalSearchDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
            case "title" -> Comparator.comparing(WorkdataTotalSearchDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
            default -> Comparator.comparing(WorkdataTotalSearchDTO::getRegDate);
        };

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        responseDTOs.sort(comparator);

        // 6) 응답 반환
        return ResponseEntity.ok(ResultDTO.of("자료글 전체 조회 성공!", responseDTOs));
    }


    /**
     * 1-4.2) 자료글 개별 조회
     * @param wsId
     * @param dataNumber
     * @return
     */
    @Override
    public ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(Long wsId, Long dataNumber) {
        // 1. 로그인 사용자 이메일
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 워크스페이스 멤버 검증
        WorkspaceMemberEntity wsMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 3. 자료글 조회
        // - Repository에서 (dataNumber, wsId)로 조회
        // - 파일/태그를 미리 로딩하기 위해 필요하다면 Fetch Join 쿼리 or @EntityGraph 사용
        WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspace_WsId(dataNumber, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 자료글을 찾을 수 없습니다."));

        // 4. DTO 변환
        // A) 직접 DTO 빌더 사용 (간단 예시)
        WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.builder()
                .dataNumber(workdataEntity.getDataNumber())
                .writer(workdataEntity.getWriter())
                .title(workdataEntity.getTitle())
                .content(workdataEntity.getContent())
                .regDate(workdataEntity.getRegDate())
                // 빈 리스트 초기화 후 아래에서 세터로 값 채우기
                .fileNames(new ArrayList<>())
                .fileUrls(new ArrayList<>())
                .tags(new ArrayList<>())
                // WorkspaceMemberEntity 관련 필드
                .mWsNumber(wsMember.getMWsNumber())
                .nickname(wsMember.getNickname())
                .wsRole(wsMember.getWsRole())
                .profileImage(wsMember.getProfileImage())
                .build();

        // 5. 파일 목록
        dto.setFileNames(
                workdataEntity.getWorkdataFiles().stream()
                        .map(WorkdataFileEntity::getFileName)
                        .distinct()
                        .collect(Collectors.toList())
        );
        dto.setFileUrls(
                workdataEntity.getWorkdataFiles().stream()
                        .map(WorkdataFileEntity::getFile)
                        .distinct()
                        .collect(Collectors.toList())
        );

        // 6. 태그 목록
        dto.setTags(
                workdataEntity.getWorkdataFileTags().stream()
                        .map(WorkDataFileTagEntity::getTag)
                        .distinct()
                        .collect(Collectors.toList())
        );

        // 7. 응답 반환
        return ResponseEntity.ok(ResultDTO.of("자료글 개별 조회 성공!", dto));
    }


    /**
     * 2. 검색 기능(workdata의 writer, title)
     * @param wsId
     * @param keyword
     * @param sort
     * @param order
     * @return
     */
    @Override
    public ResultDTO<List<WorkdataTotalSearchDTO>> searchWorkdata(Long wsId,
                                                                  String keyword,
                                                                  String sort,
                                                                  String order) {
        // 1) 로그인한 사용자 이메일
        String userEmail = AuthUtil.getLoginUserId();

        // 2) 워크스페이스 멤버 검증
        WorkspaceMemberEntity wsMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 3) 검색 실행: writer, title, fileName, tag 등에서 keyword 포함된 자료글 조회
        List<WorkdataEntity> entities = workdataRepository.searchByWorkspaceAndKeyword(wsId, keyword);

        // 4) 검색 결과 없을 경우
        if (entities.isEmpty()) {
            return ResultDTO.of("검색된 게시물이 없습니다.", Collections.emptyList());
        }

        // 5) 검색 결과 -> DTO 변환
        List<WorkdataTotalSearchDTO> dtos = entities.stream()
                .map(entity -> {
                    // 직접 DTO 빌더 사용
                    WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.builder()
                            .dataNumber(entity.getDataNumber())
                            .writer(entity.getWriter())
                            .title(entity.getTitle())
                            .content(entity.getContent())
                            .regDate(entity.getRegDate())
                            // 빈 리스트로 초기화 후 나중에 세터로 값 채움
                            .fileNames(new ArrayList<>())
                            .fileUrls(new ArrayList<>())
                            .tags(new ArrayList<>())
                            // WorkspaceMember 정보
                            .mWsNumber(wsMember.getMWsNumber())
                            .nickname(wsMember.getNickname())
                            .wsRole(wsMember.getWsRole())
                            .profileImage(wsMember.getProfileImage())
                            .build();

                    // 파일 정보 변환
                    dto.setFileNames(entity.getWorkdataFiles().stream()
                            .map(WorkdataFileEntity::getFileName)
                            .distinct()
                            .collect(Collectors.toList()));

                    dto.setFileUrls(entity.getWorkdataFiles().stream()
                            .map(WorkdataFileEntity::getFile)
                            .distinct()
                            .collect(Collectors.toList()));

                    // 태그 정보 변환
                    dto.setTags(entity.getWorkdataFileTags().stream()
                            .map(WorkDataFileTagEntity::getTag)
                            .distinct()
                            .collect(Collectors.toList()));

                    return dto;
                })
                .collect(Collectors.toList());

        // 6) 정렬 적용
        Comparator<WorkdataTotalSearchDTO> comparator = switch (sort) {
            case "writer" -> Comparator.comparing(WorkdataTotalSearchDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
            case "title"  -> Comparator.comparing(WorkdataTotalSearchDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
            default       -> Comparator.comparing(WorkdataTotalSearchDTO::getRegDate);
        };

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        dtos.sort(comparator);

        // 7) 결과 반환
        return ResultDTO.of("검색 결과 조회에 성공했습니다.", dtos);
    }


}
