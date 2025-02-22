package net.scit.backend.workdata.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.repository.WorkdataFileRepository;
import net.scit.backend.workdata.repository.WorkdataFileTagRepository;
import net.scit.backend.workdata.repository.WorkdataRepository;
import net.scit.backend.workdata.service.WorkdataService;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
     * 1. 자료글 전체 조회
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<List<WorkdataDTO>> workdata(Long wsId) {
        // 특정 워크스페이스에 속한 자료만 조회
        List<WorkdataEntity> workdataEntities = workdataRepository.findByWorkspaceEntity_WsId(wsId);

        // Entity -> DTO 변환
        List<WorkdataDTO> workdataDTOs = workdataEntities.stream()
                .map(WorkdataDTO::toDTO)
                .toList();
        log.info("조회된 자료 수: {}", workdataDTOs.size());

        // 결과 반환
        return ResultDTO.of("자료글 전체 조회에 성공했습니다.", workdataDTOs);
    }


    /**
     * 2. 자료글 개별 조회
     * @param wsId
     * @param dataNumber
     * @return
     */
    @Override
    @Transactional
    public ResultDTO<WorkdataDTO> workdataDetail(Long wsId, Long dataNumber) {
        // Workdata 조회: dataNumber에 해당하는 자료글을 찾아야 함
        WorkdataEntity workdataEntity = workdataRepository.findById(dataNumber)
                .orElseThrow(() -> new IllegalArgumentException("자료글을 찾을 수 없습니다."));

        // Workspace 유효성 검사: wsId에 해당하는 워크스페이스가 존재하는지 확인
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));

        // 워크스페이스와 연결된 자료글인지를 확인 (필요 시 추가적인 로직)
        if (!workdataEntity.getWorkspaceEntity().getWsId().equals(workspaceEntity.getWsId())) {
            return ResultDTO.of("이 자료글은 해당 워크스페이스와 관련이 없습니다.", null);
        }

        // WorkdataDTO 변환하여 반환
        WorkdataDTO workdataDTO = WorkdataDTO.toDTO(workdataEntity);
        return ResultDTO.of("자료글 상세 정보 조회 성공", workdataDTO);
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




}
