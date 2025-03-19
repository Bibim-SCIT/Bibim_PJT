package net.scit.backend.workdata.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.dto.WorkdataTotalSearchDTO;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import net.scit.backend.workdata.event.WorkdataEvent;
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

/**
 * WorkdataServiceImpl: 자료실 관련 CRUD 및 검색 기능 구현 클래스
 *
 * 주요 기능:
 * 1. 자료글 생성, 수정, 삭제
 * 2. 자료글 전체/상세 조회
 * 3. 자료글 검색 및 태그 조회
 * 4. 파일 업로드/삭제 (AWS S3 사용)
 * 5. 관련 이벤트 발행 (예: 알림 전송)
 *
 * 최적화:
 * - 중복된 워크스페이스 멤버 검증 코드를 별도 메서드(getWorkspaceMember)로 추출하여 코드 중복 제거
 * - 자료글 목록 및 검색 시 작성자 정보 조회에 대해 캐싱(map 사용)하여 DB 호출 최적화
 *
 */
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
     * 워크스페이스 내 사용자(멤버) 정보 조회
     * (중복된 워크스페이스 멤버 검증 로직을 재사용하기 위한 메서드)
     *
     * @param wsId  워크스페이스 ID
     * @param email 사용자 이메일
     * @return WorkspaceMemberEntity (멤버 엔티티)
     * @throws IllegalArgumentException 사용자가 워크스페이스에 속하지 않을 경우 예외 발생
     */
    private WorkspaceMemberEntity getWorkspaceMember(Long wsId, String email) {
        return workspaceMemberRepository.findByMember_EmailAndWorkspace_WsId(email, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));
    }

    /**
     * 워크스페이스 내 사용자 닉네임 조회
     *
     * @param wsId  워크스페이스 ID
     * @param email 사용자 이메일
     * @return 사용자 닉네임
     * @throws IllegalArgumentException 닉네임을 찾을 수 없는 경우 예외 발생
     */
    private String getSenderNickname(Long wsId, String email) {
        return workspaceMemberRepository.findByWorkspace_WsIdAndMember_Email(wsId, email)
                .map(WorkspaceMemberEntity::getNickname)
                .orElseThrow(() -> new IllegalArgumentException("닉네임을 찾을 수 없습니다."));
    }

    /**
     * 자료글 생성 및 DTO 반환
     *
     * @param wsId    워크스페이스 ID
     * @param title   자료글 제목
     * @param content 자료글 내용
     * @param files   첨부 파일 배열
     * @param tags    자료글 관련 태그 리스트
     * @return 생성된 자료글의 DTO
     */
    @Override
    public WorkdataDTO createWorkdata(Long wsId, String title, String content, MultipartFile[] files, List<String> tags) {
        // 1. 현재 로그인한 사용자 이메일 획득
        String email = AuthUtil.getLoginUserId();

        // 2. 로그인 사용자가 해당 워크스페이스에 속해 있는지 검증 후 멤버 엔티티 획득
        WorkspaceMemberEntity wsMember = getWorkspaceMember(wsId, email);

        // 3. 자료글 엔티티 생성 및 DB 저장
        WorkdataEntity workdataEntity = createWorkdataAndReturnEntity(email, title, content, wsMember);
        workdataRepository.flush();

        // 4. 파일 업로드 및 파일 엔티티 생성
        List<WorkdataFileEntity> fileEntities = new ArrayList<>();
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                try {
                    // S3에 파일 업로드 후 URL 반환
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

        // 5. 태그 엔티티 생성 및 저장
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

        // 6. 최신 자료글 엔티티 재조회 (파일 및 태그 정보 포함)
        workdataEntity = workdataRepository.findById(workdataEntity.getDataNumber())
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 7. 자료글 생성 이벤트 발행 (알림 전송)
        String senderNickname = getSenderNickname(wsId, email);
        eventPublisher.publishEvent(new WorkdataEvent(workdataEntity, email, senderNickname, "create"));

        // 8. 자료글 엔티티를 DTO로 변환하여 반환
        return WorkdataDTO.toDTO(workdataEntity, new HashSet<>(fileEntities), new HashSet<>(tagEntities), wsMember);
    }

    /**
     * 자료글 엔티티 생성 및 DB 저장 (내부 사용)
     *
     * @param email    작성자 이메일
     * @param title    자료글 제목
     * @param content  자료글 내용
     * @param wsMember 작성자에 해당하는 워크스페이스 멤버 엔티티
     * @return 저장된 WorkdataEntity 객체
     */
    private WorkdataEntity createWorkdataAndReturnEntity(String email, String title, String content, WorkspaceMemberEntity wsMember) {
        WorkdataEntity entity = WorkdataEntity.builder()
                .workspaceMember(wsMember)
                .workspace(wsMember.getWorkspace())
                .writer(email)
                .title(title)
                .content(content)
                .regDate(LocalDateTime.now()) // 자료글 등록 시간
                .build();
        return workdataRepository.save(entity);
    }

    /**
     * 자료글 삭제 (파일 및 태그 포함)
     *
     * @param wsId       워크스페이스 ID
     * @param dataNumber 삭제할 자료글의 고유 번호
     * @return 삭제 결과 메시지를 포함한 SuccessDTO를 감싼 ResultDTO
     */
    @Override
    public ResultDTO<SuccessDTO> deleteWorkdata(Long wsId, Long dataNumber) {
        // 1. 현재 로그인한 사용자 이메일 획득
        String email = AuthUtil.getLoginUserId();

        // 2. 로그인 사용자가 해당 워크스페이스에 속해 있는지 검증
        getWorkspaceMember(wsId, email);

        // 3. 삭제할 자료글 엔티티 조회
        WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 4. 작성자 검증: 작성자와 현재 로그인 사용자가 일치해야 함
        if (!workdataEntity.getWriter().equals(email)) {
            throw new IllegalArgumentException("본인만 삭제할 수 있습니다.");
        }

        // 5. 자료글 삭제 (Cascade 옵션으로 파일 및 태그도 함께 삭제됨)
        workdataRepository.delete(workdataEntity);

        // 6. 삭제 이벤트 발행 (알림 전송)
        String senderNickname = getSenderNickname(wsId, email);
        eventPublisher.publishEvent(new WorkdataEvent(workdataEntity, email, senderNickname, "delete"));

        // 7. 성공 응답 반환
        SuccessDTO successDTO = SuccessDTO.builder().success(true).build();
        return ResultDTO.of("자료글 및 관련 파일/태그 삭제에 성공하였습니다.", successDTO);
    }

    /**
     * 자료글 수정 (파일 및 태그 수정 포함)
     *
     * @param wsId         워크스페이스 ID
     * @param dataNumber   수정할 자료글의 고유 번호
     * @param title        수정된 제목 (null이면 기존 제목 유지)
     * @param content      수정된 내용 (null이면 기존 내용 유지)
     * @param deleteFiles  삭제할 파일 이름 리스트
     * @param deleteTags   삭제할 태그 리스트
     * @param newTags      추가할 새로운 태그 리스트
     * @param newFiles     추가할 새로운 파일 배열
     * @return 수정 결과 메시지를 포함한 SuccessDTO를 감싼 ResultDTO
     */
    @Override
    public ResultDTO<SuccessDTO> updateWorkdata(Long wsId,
                                                Long dataNumber,
                                                String title,
                                                String content,
                                                List<String> deleteFiles,
                                                List<String> deleteTags,
                                                List<String> newTags,
                                                MultipartFile[] newFiles) {

        // 1. 현재 로그인한 사용자 이메일 획득
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 로그인 사용자가 해당 워크스페이스에 속해 있는지 검증
        getWorkspaceMember(wsId, userEmail);

        // 3. 수정할 자료글 엔티티 조회
        WorkdataEntity existingEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 4. 작성자 검증: 작성자와 현재 로그인 사용자가 일치해야 함
        if (!existingEntity.getWriter().equals(userEmail)) {
            throw new IllegalArgumentException("본인만 수정할 수 있습니다.");
        }

        // 기존 작성자 및 워크스페이스 정보 유지
        WorkspaceMemberEntity existingWorkspaceMember = existingEntity.getWorkspaceMember();

        /* ---------------------------
         *    파일 삭제 처리
         * ---------------------------
         * 1) 삭제할 파일 목록 조회 (자료글에 해당하는 파일 중, 삭제 요청된 파일명과 일치하는 파일)
         * 2) 각 파일에 대해 S3에서 삭제 수행
         * 3) DB에서 해당 파일 엔티티 삭제
         */
        if (deleteFiles != null && !deleteFiles.isEmpty()) {
            List<WorkdataFileEntity> filesToDelete = workdataFileRepository.findByFileNameInAndWorkdataEntity(deleteFiles, existingEntity);
            filesToDelete.forEach(fileEntity -> {
                try {
                    String fileUrl = fileEntity.getFile(); // S3에 저장된 전체 파일 URL
                    // S3Uploader의 deleteFile 메서드에 필요한 key 추출 (URL의 경로 부분에서 첫 문자 제거)
                    s3Uploader.deleteFile(new URL(fileUrl).getPath().substring(1));
                } catch (MalformedURLException e) {
                    log.error("잘못된 파일 URL: {}", fileEntity.getFile(), e);
                    throw new RuntimeException("파일 삭제 중 오류 발생: 잘못된 URL 형식입니다.");
                }
            });
            workdataFileRepository.deleteAll(filesToDelete);
        }

        /* ---------------------------
         *    태그 삭제 및 추가 처리
         * ---------------------------
         * 1) 기존에 등록된 태그를 조회하여 중복 확인
         * 2) 삭제할 태그는 DB에서 제거
         * 3) 추가할 태그는 기존 태그와 중복되지 않는 경우에만 DB에 추가
         */
        Set<String> existingTags = workdataFileTagRepository.findByWorkdataEntity(existingEntity)
                .stream()
                .map(WorkDataFileTagEntity::getTag)
                .collect(Collectors.toSet());

        if (deleteTags != null && !deleteTags.isEmpty()) {
            List<WorkDataFileTagEntity> tagsToRemove = workdataFileTagRepository.findByTagInAndWorkdataEntity(deleteTags, existingEntity);
            workdataFileTagRepository.deleteAll(tagsToRemove);
        }

        if (newTags != null && !newTags.isEmpty()) {
            // 기존 태그와 중복 제거 후 추가
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
         * ---------------------------
         * 1) 현재 자료글에 등록된 파일 이름 조회 (중복 업로드 방지)
         * 2) 새 파일들에 대해 S3 업로드 및 파일 엔티티 생성
         * 3) DB에 새 파일 엔티티 저장
         */
        if (newFiles != null && newFiles.length > 0) {
            Set<String> existingFileNames = workdataFileRepository.findByWorkdataEntity(existingEntity)
                    .stream()
                    .map(WorkdataFileEntity::getFileName)
                    .collect(Collectors.toSet());
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
         *    자료글 제목 및 내용 수정
         * ---------------------------
         * 1) 제목과 내용은 null이 아닌 경우에만 수정
         * 2) 작성자 및 워크스페이스 정보는 기존 값 유지
         */
        existingEntity.setTitle(title != null ? title : existingEntity.getTitle());
        existingEntity.setContent(content != null ? content : existingEntity.getContent());
        existingEntity.setWorkspaceMember(existingWorkspaceMember);

        // 수정된 자료글 엔티티 DB에 저장
        workdataRepository.save(existingEntity);

        // 수정 이벤트 발행 (알림 전송)
        String senderNickname = getSenderNickname(wsId, userEmail);
        eventPublisher.publishEvent(new WorkdataEvent(existingEntity, userEmail, senderNickname, "update"));

        // 수정 결과 응답 반환
        return ResultDTO.of("자료글 수정 완료!", SuccessDTO.builder().success(true).build());
    }

    /**
     * 자료글 전체 조회 (정렬 포함)
     *
     * @param wsId  워크스페이스 ID
     * @param sort  정렬 기준 ("writer", "title", "regDate" 등)
     * @param order 정렬 순서 ("asc" 또는 "desc")
     * @return 자료글 목록을 포함한 DTO를 감싼 ResponseEntity
     */
    @Override
    public ResponseEntity<ResultDTO<List<WorkdataTotalSearchDTO>>> workdata(Long wsId, String sort, String order) {
        // 1. 현재 로그인한 사용자 이메일 획득
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 로그인 사용자가 해당 워크스페이스에 속해 있는지 검증
        getWorkspaceMember(wsId, userEmail);

        // 3. 자료글 목록 조회 (파일 및 태그 정보 함께 로딩)
        List<WorkdataEntity> workdataEntities = Optional.ofNullable(workdataRepository.findWithFilesAndTags(wsId))
                .orElse(Collections.emptyList());

        // 4. 작성자 정보 캐싱 (동일 작성자에 대한 중복 DB 호출 최소화)
        Map<String, WorkspaceMemberEntity> memberCache = new HashMap<>();

        // 5. 각 자료글을 DTO로 변환
        List<WorkdataTotalSearchDTO> responseDTOs = workdataEntities.stream()
                .map(entity -> {
                    // 작성자 이메일 기반 캐싱: 작성자 정보가 없으면 DB에서 조회 후 저장
                    WorkspaceMemberEntity writerMember = memberCache.computeIfAbsent(entity.getWriter(),
                            email -> workspaceMemberRepository.findByMember_EmailAndWorkspace_WsId(email, wsId)
                                    .orElseThrow(() -> new IllegalArgumentException("해당 작성자의 워크스페이스 정보를 찾을 수 없습니다.")));

                    // DTO 생성 및 작성자, 등록일 등 기본 정보 설정
                    WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.builder()
                            .dataNumber(entity.getDataNumber())
                            .writer(entity.getWriter())
                            .title(entity.getTitle())
                            .content(entity.getContent())
                            .regDate(entity.getRegDate())
                            .mWsNumber(writerMember.getMWsNumber())
                            .nickname(writerMember.getNickname())
                            .wsRole(writerMember.getWsRole())
                            .profileImage(writerMember.getProfileImage())
                            .build();

                    // 첨부 파일 정보 설정 (파일명, URL)
                    dto.setFileNames(
                            entity.getWorkdataFiles().stream()
                                    .map(WorkdataFileEntity::getFileName)
                                    .distinct()
                                    .collect(Collectors.toList())
                    );
                    dto.setFileUrls(
                            entity.getWorkdataFiles().stream()
                                    .map(WorkdataFileEntity::getFile)
                                    .distinct()
                                    .collect(Collectors.toList())
                    );
                    // 태그 정보 설정
                    dto.setTags(
                            entity.getWorkdataFileTags().stream()
                                    .map(WorkDataFileTagEntity::getTag)
                                    .distinct()
                                    .collect(Collectors.toList())
                    );

                    return dto;
                })
                .collect(Collectors.toList());

        // 6. 정렬 처리 (기본 정렬은 등록일 기준)
        Comparator<WorkdataTotalSearchDTO> comparator = switch (sort) {
            case "writer" -> Comparator.comparing(WorkdataTotalSearchDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
            case "title" -> Comparator.comparing(WorkdataTotalSearchDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
            default -> Comparator.comparing(WorkdataTotalSearchDTO::getRegDate);
        };

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        responseDTOs.sort(comparator);

        // 7. 결과 응답 반환
        return ResponseEntity.ok(ResultDTO.of("자료글 전체 조회 성공!", responseDTOs));
    }

    /**
     * 자료글 개별 상세 조회
     *
     * @param wsId       워크스페이스 ID
     * @param dataNumber 상세 조회할 자료글의 고유 번호
     * @return 자료글 상세 정보를 포함한 DTO를 감싼 ResponseEntity
     */
    @Override
    public ResponseEntity<ResultDTO<WorkdataTotalSearchDTO>> workdataDetail(Long wsId, Long dataNumber) {
        // 1. 현재 로그인한 사용자 이메일 획득
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 로그인 사용자가 해당 워크스페이스에 속해 있는지 검증
        getWorkspaceMember(wsId, userEmail);

        // 3. 자료글 상세 조회 (자료글과 워크스페이스 ID 매칭)
        WorkdataEntity workdataEntity = workdataRepository.findByDataNumberAndWorkspace_WsId(dataNumber, wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 자료글을 찾을 수 없습니다."));

        // 4. 자료글 작성자 정보 조회
        WorkspaceMemberEntity writerMember = workspaceMemberRepository
                .findByMember_EmailAndWorkspace_WsId(workdataEntity.getWriter(), wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 작성자의 워크스페이스 정보를 찾을 수 없습니다."));

        // 5. DTO 생성 및 기본 정보 설정
        WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.builder()
                .dataNumber(workdataEntity.getDataNumber())
                .writer(workdataEntity.getWriter())
                .title(workdataEntity.getTitle())
                .content(workdataEntity.getContent())
                .regDate(workdataEntity.getRegDate())
                .fileNames(new ArrayList<>())
                .fileUrls(new ArrayList<>())
                .tags(new ArrayList<>())
                .mWsNumber(writerMember.getMWsNumber())
                .nickname(writerMember.getNickname())
                .wsRole(writerMember.getWsRole())
                .profileImage(writerMember.getProfileImage())
                .build();

        // 6. 첨부 파일 정보 설정
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

        // 7. 태그 정보 설정
        dto.setTags(
                workdataEntity.getWorkdataFileTags().stream()
                        .map(WorkDataFileTagEntity::getTag)
                        .distinct()
                        .collect(Collectors.toList())
        );

        // 8. 결과 응답 반환
        return ResponseEntity.ok(ResultDTO.of("자료글 개별 조회 성공!", dto));
    }

    /**
     * 워크스페이스 내 모든 태그 조회
     *
     * @param wsId 워크스페이스 ID
     * @return 해당 워크스페이스에 등록된 태그 리스트
     * @throws CustomException 태그가 존재하지 않을 경우 예외 발생
     */
    @Transactional
    @Override
    public List<String> getAllTags(Long wsId) {
        // 1. 현재 로그인한 사용자 이메일 획득
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 로그인 사용자가 해당 워크스페이스에 속해 있는지 검증
        getWorkspaceMember(wsId, userEmail);

        // 3. 워크스페이스 내 모든 태그 조회
        List<String> tags = workdataFileTagRepository.findAllTagsByWorkspace(wsId);
        if (tags.isEmpty()) {
            throw new CustomException(ErrorCode.TAGS_NOT_FOUND);
        }

        log.info("조회된 태그 개수: {}", tags.size());
        return tags;
    }

    /**
     * 자료글 검색 (작성자, 제목, 파일명, 태그 등 포함)
     *
     * @param wsId    워크스페이스 ID
     * @param keyword 검색 키워드
     * @param sort    정렬 기준 ("writer", "title", "regDate" 등)
     * @param order   정렬 순서 ("asc" 또는 "desc")
     * @return 검색 결과 자료글 리스트를 포함한 DTO를 감싼 ResultDTO
     */
    @Override
    public ResultDTO<List<WorkdataTotalSearchDTO>> searchWorkdata(Long wsId,
                                                                  String keyword,
                                                                  String sort,
                                                                  String order) {
        // 1. 현재 로그인한 사용자 이메일 획득
        String userEmail = AuthUtil.getLoginUserId();

        // 2. 로그인 사용자가 해당 워크스페이스에 속해 있는지 검증
        getWorkspaceMember(wsId, userEmail);

        // 3. 키워드가 포함된 자료글 검색 (작성자, 제목, 파일명, 태그 등)
        List<WorkdataEntity> entities = workdataRepository.searchByWorkspaceAndKeyword(wsId, keyword);

        // 4. 검색 결과가 없는 경우 빈 결과 반환
        if (entities.isEmpty()) {
            return ResultDTO.of("검색된 게시물이 없습니다.", Collections.emptyList());
        }

        // 5. 작성자 정보 캐싱하여 각 자료글을 DTO로 변환 (DB 호출 최소화)
        Map<String, WorkspaceMemberEntity> memberCache = new HashMap<>();
        List<WorkdataTotalSearchDTO> dtos = entities.stream()
                .map(entity -> {
                    WorkspaceMemberEntity writerMember = memberCache.computeIfAbsent(entity.getWriter(),
                            email -> workspaceMemberRepository.findByMember_EmailAndWorkspace_WsId(email, wsId)
                                    .orElseThrow(() -> new IllegalArgumentException("해당 작성자의 워크스페이스 정보를 찾을 수 없습니다.")));

                    WorkdataTotalSearchDTO dto = WorkdataTotalSearchDTO.builder()
                            .dataNumber(entity.getDataNumber())
                            .writer(entity.getWriter())
                            .title(entity.getTitle())
                            .content(entity.getContent())
                            .regDate(entity.getRegDate())
                            .fileNames(new ArrayList<>())
                            .fileUrls(new ArrayList<>())
                            .tags(new ArrayList<>())
                            .mWsNumber(writerMember.getMWsNumber())
                            .nickname(writerMember.getNickname())
                            .wsRole(writerMember.getWsRole())
                            .profileImage(writerMember.getProfileImage())
                            .build();

                    dto.setFileNames(entity.getWorkdataFiles().stream()
                            .map(WorkdataFileEntity::getFileName)
                            .distinct()
                            .collect(Collectors.toList()));

                    dto.setFileUrls(entity.getWorkdataFiles().stream()
                            .map(WorkdataFileEntity::getFile)
                            .distinct()
                            .collect(Collectors.toList()));

                    dto.setTags(entity.getWorkdataFileTags().stream()
                            .map(WorkDataFileTagEntity::getTag)
                            .distinct()
                            .collect(Collectors.toList()));

                    return dto;
                })
                .collect(Collectors.toList());

        // 6. 정렬 처리 (기본 정렬은 등록일 기준)
        Comparator<WorkdataTotalSearchDTO> comparator = switch (sort) {
            case "writer" -> Comparator.comparing(WorkdataTotalSearchDTO::getWriter, String.CASE_INSENSITIVE_ORDER);
            case "title"  -> Comparator.comparing(WorkdataTotalSearchDTO::getTitle, String.CASE_INSENSITIVE_ORDER);
            default       -> Comparator.comparing(WorkdataTotalSearchDTO::getRegDate);
        };

        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        dtos.sort(comparator);

        // 7. 검색 결과 응답 반환
        return ResultDTO.of("검색 결과 조회에 성공했습니다.", dtos);
    }
}
