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

    /**
     * 4. 자료글 삭제
     * @param wsId
     * @param dataNumber
     * @param currentUserEmail
     * @return
     */


    /**
     * 5. 자료글 수정
     * @param wsId
     * @param dataNumber
     * @param workdataDTO
     * @return
     */


    /**
     * 10. 검색 기능(workdata의 writer, title)
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
