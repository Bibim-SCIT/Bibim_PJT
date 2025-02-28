package net.scit.backend.workspace.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
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

        validateChannelName(channelName);

        WorkspaceMemberEntity memberEntity = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(workspaceId, userEmail)
                .filter(member -> "owner".equals(member.getWsRole()))
                .orElseThrow(() -> new SecurityException("채널 생성 권한이 없습니다."));

        if (workspaceChannelRepository.existsByWorkspace_wsIdAndChannelName(workspaceId, channelName)) {
            throw new IllegalStateException("이미 존재하는 채널입니다.");
        }

        workspaceChannelRepository.save(
                WorkspaceChannelEntity.builder()
                        .workspace(memberEntity.getWorkspace())
                        .channelName(channelName)
                        .build()
        );

        log.info("채널 생성 완료: channelName={}, workspaceId={}", channelName, workspaceId);
        return buildSuccessResponse("채널 생성 완료");
    }

    private void validateChannelName(String channelName) {
        if (channelName == null || channelName.isBlank()) {
            throw new IllegalArgumentException("채널 이름을 입력해야 합니다.");
        }
    }

    private ResultDTO<SuccessDTO> buildSuccessResponse(String message) {
        return ResultDTO.<SuccessDTO>builder()
                .message(message)
                .data(SuccessDTO.builder().success(true).build())  // 기존 SuccessDTO 수정 없이 해결
                .build();
    }

    /**
     * 2. 채널 삭제
     * @param channelNumber
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> deleteChannel(Long channelNumber) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("채널 삭제 요청: channelId={}, userEmail={}", channelNumber, userEmail);

        workspaceChannelRepository.findById(channelNumber)
                .ifPresentOrElse(channel -> {
                    workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(channel.getWorkspace().getWsId(), userEmail)
                            .filter(member -> "owner".equals(member.getWsRole()))
                            .ifPresentOrElse(
                                    member -> {
                                        workspaceChannelRepository.delete(channel);
                                        log.info("채널 삭제 완료: channelNumber={}", channelNumber);
                                    },
                                    () -> { throw new CustomException(ErrorCode.CHANNEL_DELETE_FORBIDDEN); }
                            );
                }, () -> { throw new CustomException(ErrorCode.CHANNEL_NOT_FOUND); });

        return ResultDTO.of("채널 삭제 완료", SuccessDTO.builder().success(true).build());
    }
}
