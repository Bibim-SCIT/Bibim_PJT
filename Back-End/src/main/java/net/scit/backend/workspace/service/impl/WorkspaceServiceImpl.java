package net.scit.backend.workspace.service.impl;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.entity.WorkspaceRoleEntity;
import net.scit.backend.workspace.repository.WorkspaceChennelRepository;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import net.scit.backend.workspace.repository.WorkspaceRoleRepository;
import net.scit.backend.workspace.service.WorkspaceService;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final MemberRepository memberRepository;
    private final WorkspaceRoleRepository workspaceRoleRepository;
    private final WorkspaceChennelRepository workspaceChennelRepository;

    /**
     * 워크스페이스 생성 메소드
     * 
     * @param workspaceDTO 워크스페이스 대한 정보
     * @return 결과 확인 메세지
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO) {
        // 새로운 워크스페이스 생성
        WorkspaceEntity workspaceEntity;
        workspaceEntity = WorkspaceEntity.toEntity(workspaceDTO);
        workspaceEntity = workspaceRepository.saveAndFlush(workspaceEntity);

        // 채널의 기본 역할을 추가함
        WorkspaceRoleEntity workspaceRoleEntity = WorkspaceRoleEntity.builder()
                .workspace(workspaceEntity).build();
        workspaceRoleRepository.saveAndFlush(workspaceRoleEntity);

        // 현재 로그인한 유저 이메일을 가져옴
        String email = getCurrentUserEmail();

        // 현재 로그인한 유저의 정보를 가져옴
        MemberEntity memberEntity = memberRepository.findById(email).get();

        // 워크스페이스 멤버 엔티티에 데이터를 저장
        WorkspaceMemberEntity workspaceMemberEntity = WorkspaceMemberEntity.builder()
                .member(memberEntity)
                .workspace(workspaceEntity)
                .chRoleNumber(workspaceRoleEntity)
                .nickname(memberEntity.getName())
                .profileImage(memberEntity.getProfileImage())
                .build();
        workspaceMemberRepository.save(workspaceMemberEntity);

        //워크스페이스 채널 생성
        WorkspaceChannelEntity workspaceChannelEntity = WorkspaceChannelEntity.builder()
                .workspace(workspaceEntity)
                .workspaceRole(workspaceRoleEntity)
                .channelName("새 채널")
                .build();
        workspaceChennelRepository.save(workspaceChannelEntity);

        // 자료실이 들어갈 자리

        // 성공시 DTO 저장
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("워크스페이스 생성에 성공했습니다.", successDTO);

    }

    /**
     * 현재 로그인한 유저의 이메일을 가져오는 메소드
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
     * 워크스페이스 삭제 메소드
     * 
     */
    @Override
    public ResultDTO<SuccessDTO> workspaceDelete(String wsName, String email) 
    {
        Long wsId = workspaceRepository.findWorkspaceIdByWsNameAndEmail(wsName, email);
        workspaceRepository.deleteById(wsId);   
        // 성공시 DTO 저장
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("워크스페이스 삭제에 성공했습니다.", successDTO);
    }

}
