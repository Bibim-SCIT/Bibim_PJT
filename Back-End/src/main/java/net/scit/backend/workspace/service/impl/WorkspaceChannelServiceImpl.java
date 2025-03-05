package net.scit.backend.workspace.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.workspace.dto.ChannelUpdateRequest;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;

import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceChannelRepository;
import net.scit.backend.workspace.repository.WorkspaceChannelRoleRepository;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.service.WorkspaceChannelService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceChannelServiceImpl implements WorkspaceChannelService {

    private final WorkspaceChannelRepository workspaceChannelRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceChannelRoleRepository workspaceChannelRoleRepository;

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

    /**
     * 3. 채널 수정(채널 역할, 이름만)
     * @param channelNumber
     * @param request
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> updateChannel(Long channelNumber, ChannelUpdateRequest request) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("채널 수정 요청: channelNumber={}, userEmail={}", channelNumber, userEmail);

        workspaceChannelRepository.findById(channelNumber)
                .ifPresentOrElse(channel -> workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(
                                        channel.getWorkspace().getWsId(), userEmail)
                                .filter(member -> "owner".equals(member.getWsRole()))
                                .ifPresentOrElse(member -> {
                                    if (request.getChannelName() != null && !request.getChannelName().isBlank()) {
                                        channel.setChannelName(request.getChannelName());
                                    }
                                    if (request.getWorkspaceRole() != null) {
                                        workspaceChannelRoleRepository.findById(request.getWorkspaceRole())
                                                .ifPresentOrElse(channel::setWorkspaceRole,
                                                        () -> { throw new CustomException(ErrorCode.ROLE_NOT_FOUND); });
                                    }
                                    workspaceChannelRepository.save(channel);
                                    log.info("채널 수정 완료: channelNumber={}", channelNumber);
                                }, () -> { throw new CustomException(ErrorCode.CHANNEL_UPDATE_FORBIDDEN); })
                        , () -> { throw new CustomException(ErrorCode.CHANNEL_NOT_FOUND); });

        return ResultDTO.of("채널 수정 완료", SuccessDTO.builder().success(true).build());
    }

    public ResultDTO<SuccessDTO> readChannel()
    {
        return ResultDTO.of("채널 불러오기 완료", SuccessDTO.builder().success(true).build());
    }

}
