package net.scit.backend.workdata.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
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
import net.scit.backend.workspace.repository.WorkspaceRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

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
    private final MemberRepository memberRepository;

    /**
     * 현재 로그인한 유저의 이메일을 가져오는 메소드(토큰 기능 추가 시 변경 예정)
     */
    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername(); // email 반환
        } else {
            return principal.toString();
        }
    }


    /**
     * 1. 자료글 전체 조회(+정렬)
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
     * 2. 자료글 개별 조회
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
     * 3. 자료글 등록
     * @param wsId
     * @param workdataDTO
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workdataCreate(Long wsId, WorkdataDTO workdataDTO) {
        log.info("wsId: {}", wsId);
        log.info("workdataDTO: {}", workdataDTO.toString());

        // WorkspaceEntity 조회
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("해당 워크스페이스가 존재하지 않습니다. ID: " + wsId));

        // MemberEntity 조회
        MemberEntity memberEntity = memberRepository.findByEmail(workdataDTO.getWriter())
                .orElseThrow(() -> new IllegalArgumentException("이메일이 존재하지 않습니다: " + workdataDTO.getWriter()));

        // WorkdataEntity 생성
        WorkdataEntity workdataEntity = WorkdataEntity.toEntity(workdataDTO, workspaceEntity);
        workdataEntity.setWriter(memberEntity.getEmail()); // writer는 수정 불가

        workdataRepository.save(workdataEntity);

        // SuccessDTO 객체 생성 (빌더 패턴 사용)
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("자료글 생성에 성공했습니다.", successDTO);
    }


    /**
     * 4. 자료글 삭제
     * @param wsId
     * @param dataNumber
     * @param currentUserEmail
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workdataDelete(Long wsId, Long dataNumber, String currentUserEmail) {
        WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // 현재 로그인한 사용자가 작성자인지 확인
        if (!workdataEntity.getWriter().equals(currentUserEmail)) {
            SuccessDTO failDTO = SuccessDTO.builder()
                    .success(false)
                    .build();
            return ResultDTO.of("본인만 삭제할 수 있습니다.", failDTO);
        }

        workdataRepository.delete(workdataEntity);

        // SuccessDTO 객체 생성 (빌더 패턴 사용)
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("자료글 삭제에 성공했습니다.", successDTO);
    }


    /**
     * 5. 자료글 수정
     * @param wsId
     * @param dataNumber
     * @param workdataDTO
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<WorkdataDTO> workdataUpdate(Long wsId, Long dataNumber, WorkdataDTO workdataDTO) {
        // dataNumber에 해당하는 자료글 조회
        WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // workdataDTO에서 가져온 작성자 이메일
        String currentUserEmail = workdataDTO.getWriter();  // 현재 로그인된 사용자의 이메일

        // 작성자와 현재 로그인된 사용자 이메일 비교
        if (!workdataEntity.getWriter().equals(currentUserEmail)) {
            return ResultDTO.of("본인만 수정할 수 있습니다.", null);
        }

        // 수정 작업
        workdataEntity.setTitle(workdataDTO.getTitle());
        workdataEntity.setContent(workdataDTO.getContent());
        workdataEntity.setRegDate(LocalDateTime.now());  // 수정 시간 갱신

        // 워크스페이스 업데이트
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));
        workdataEntity.setWorkspaceEntity(workspaceEntity);

        // DB에 저장
        workdataRepository.save(workdataEntity);

        // 수정된 자료글 DTO 반환
        WorkdataDTO updatedWorkdataDTO = WorkdataDTO.toDTO(workdataEntity);
        return ResultDTO.of("자료글 수정에 성공했습니다.", updatedWorkdataDTO);
    }


    /**
     * 10. 검색 기능(workdata의 writer, title)
     * @param wsId
     * @param keyword
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<List<WorkdataDTO>> searchWorkdata(Long wsId, String keyword) {
        // 1. WorkspaceEntity 조회
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));

        // 2. 검색: 워크스페이스 내에서 writer, title, fileName에 keyword가 포함된 자료글 조회
        List<WorkdataEntity> entities = workdataRepository.searchByWorkspaceAndKeyword(wsId, keyword);

        // 검색 결과가 없을 경우 메시지 반환
        if (entities.isEmpty()) {
            return ResultDTO.of("게시물이 존재하지 않습니다.", List.of());
        }

        // 3. 검색 결과를 DTO로 변환하여 반환
        List<WorkdataDTO> dtos = entities.stream()
                .map(WorkdataDTO::toDTO)
                .toList();

        return ResultDTO.of("검색 결과 조회에 성공했습니다.", dtos);
    }


    /**
     * 11. 자료 동적 정렬(writer, title, reg_date, file_name)
     * @param wsId
     * @param sortField
     * @param sortOrder
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<List<WorkdataDTO>> getSortedWorkdata(Long wsId, String sortField, String sortOrder) {
        // 정렬 방향 결정 (asc 또는 desc)
        Sort.Direction direction = sortOrder.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property;

        // 정렬 요소에 따른 엔티티 필드 매핑 (WorkdataEntity 기준)
        switch (sortField.toLowerCase()) {
            case "writer":
                property = "writer";
                break;
            case "title":
                property = "title";
                break;
            case "reg_date":
                property = "regDate";
                break;
            case "file_name":
                // WorkdataEntity와 연결된 WorkdataFileEntity의 fileName 필드
                property = "workdataFile.fileName";
                break;
            default:
                // 기본 정렬: reg_date 내림차순
                property = "regDate";
                direction = Sort.Direction.DESC;
                break;
        }
        Sort sort = Sort.by(direction, property);

        // 워크스페이스에 속한 자료글 조회 (정렬 적용)
        List<WorkdataEntity> entities = workdataRepository.findByWorkspaceEntity_WsId(wsId, sort);
        List<WorkdataDTO> dtos = entities.stream()
                .map(WorkdataDTO::toDTO)
                .toList();

        return ResultDTO.of("각 요소별 자료글 정렬에 성공했습니다.", dtos);
    }


    //자료글 생성 통합본 메서드 추가
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

}
