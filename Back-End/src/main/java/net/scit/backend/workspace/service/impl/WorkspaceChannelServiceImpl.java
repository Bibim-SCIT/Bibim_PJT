package net.scit.backend.workspace.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
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
     * 채널 생성 메서드
     * @param workspaceId 워크스페이스 ID
     * @param channelName 생성할 채널 이름
     * @return 성공 여부를 포함한 ResultDTO
     */
    @Override
    public ResultDTO<SuccessDTO> createChannel(Long workspaceId, String channelName) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("채널 생성 요청: workspaceId={}, userEmail={}, channelName={}", workspaceId, userEmail, channelName);

        validateChannelName(channelName);
        validateOwnerRole(workspaceId, userEmail);

        if (workspaceChannelRepository.existsByWorkspace_wsIdAndChannelName(workspaceId, channelName)) {
            throw new CustomException(ErrorCode.CHANNEL_ALREADY_EXISTS);
        }

        WorkspaceChannelEntity channel = WorkspaceChannelEntity.builder()
                .workspace(workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(workspaceId, userEmail).get().getWorkspace())
                .channelName(channelName)
                .build();
        workspaceChannelRepository.save(channel);

        log.info("채널 생성 완료: channelName={}, workspaceId={}", channelName, workspaceId);
        return buildSuccessResponse("채널 생성 완료");
    }

    /**
     * 채널 삭제 메서드
     * @param channelNumber 삭제할 채널 ID
     * @return 성공 여부를 포함한 ResultDTO
     */
    @Override
    public ResultDTO<SuccessDTO> deleteChannel(Long channelNumber) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("채널 삭제 요청: channelId={}, userEmail={}", channelNumber, userEmail);

        WorkspaceChannelEntity channel = workspaceChannelRepository.findById(channelNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.CHANNEL_NOT_FOUND));

        validateOwnerRole(channel.getWorkspace().getWsId(), userEmail);
        workspaceChannelRepository.delete(channel);

        log.info("채널 삭제 완료: channelNumber={}", channelNumber);
        return buildSuccessResponse("채널 삭제 완료");
    }

    /**
     * 채널 정보 수정 메서드 (채널 이름, 역할 수정 가능)
     * @param channelNumber 수정할 채널 ID
     * @param request 채널 수정 요청 데이터
     * @return 성공 여부를 포함한 ResultDTO
     */
    @Override
    public ResultDTO<SuccessDTO> updateChannel(Long channelNumber, ChannelUpdateRequest request) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("채널 수정 요청: channelNumber={}, userEmail={}", channelNumber, userEmail);

        WorkspaceChannelEntity channel = workspaceChannelRepository.findById(channelNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.CHANNEL_NOT_FOUND));

        validateOwnerRole(channel.getWorkspace().getWsId(), userEmail);

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

        return buildSuccessResponse("채널 수정 완료");
    }

    /**
     * 채널 이름 유효성 검사
     * @param channelName 검사할 채널 이름
     */
    private void validateChannelName(String channelName) {
        if (channelName == null || channelName.isBlank()) {
            throw new CustomException(ErrorCode.CHANNEL_NOT_FOUND);
        }
    }

    /**
     * 사용자 권한 검증 (채널 소유자 여부 확인)
     * @param workspaceId 워크스페이스 ID
     * @param userEmail 검증할 사용자 이메일
     */
    private void validateOwnerRole(Long workspaceId, String userEmail) {
        workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(workspaceId, userEmail)
                .filter(member -> "owner".equals(member.getWsRole()))
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED));
    }

    /**
     * 성공 응답 생성 메서드
     * @param message 응답 메시지
     * @return 성공 여부를 포함한 ResultDTO
     */
    private ResultDTO<SuccessDTO> buildSuccessResponse(String message) {
        return ResultDTO.of(message, SuccessDTO.builder().success(true).build());
    }
}
