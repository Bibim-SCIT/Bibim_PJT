package net.scit.backend.workspace.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceChannelRepository;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.service.WorkspaceChannelService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceChannelServiceImpl implements WorkspaceChannelService {

    private final WorkspaceChannelRepository workspaceChannelRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    /**
     * 1. 채널 생성
     * @param workspaceId
     * @param channelName
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> createChannel(Long workspaceId, String channelName) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("채널 생성 요청: workspaceId={}, userEmail={}, channelName={}", workspaceId, userEmail, channelName);

        // 워크스페이스 멤버 검증
        WorkspaceMemberEntity memberEntity = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(workspaceId, userEmail)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 속한 워크스페이스를 찾을 수 없습니다."));

        // 권한 확인 (wsRole이 'owner'인지 검사)
        if (!"owner".equals(memberEntity.getWsRole())) {
            log.warn("채널 생성 권한 부족: userEmail={}, wsRole={}", userEmail, memberEntity.getWsRole());
            throw new SecurityException("채널 생성 권한이 없습니다.");
        }

        // 채널 생성
        WorkspaceChannelEntity channelEntity = WorkspaceChannelEntity.builder()
                .workspace(memberEntity.getWorkspace())
                .channelName(channelName)
                .build();

        // 채널 저장
        workspaceChannelRepository.save(channelEntity);
        log.info("채널 생성 완료: channelName={}, workspaceId={}", channelName, workspaceId);

        // SuccessDTO 생성 (빌더 사용)
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        // ResultDTO 반환 (빌더 사용)
        return ResultDTO.<SuccessDTO>builder()
                .message("채널 생성 완료")
                .data(successDTO)
                .build();
    }
}
