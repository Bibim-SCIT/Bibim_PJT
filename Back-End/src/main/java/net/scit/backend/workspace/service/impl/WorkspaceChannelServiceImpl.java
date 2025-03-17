package net.scit.backend.workspace.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.dto.WorkspaceChannelLoginStatusDTO;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.workspace.dto.ChannelDTO;
import net.scit.backend.workspace.dto.ChannelUpdateRequest;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.event.WorkspaceChannelEvent;
import net.scit.backend.workspace.repository.WorkspaceChannelRepository;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.service.WorkspaceChannelService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceChannelServiceImpl implements WorkspaceChannelService {

    private final WorkspaceChannelRepository channelRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final WorkspaceChannelRepository workspaceChannelRepository;

    private WorkspaceMemberEntity getMember(Long wsId, String email) {
        return memberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));
    }

    private WorkspaceChannelEntity getChannel(Long channelNumber) {
        return channelRepository.findById(channelNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.CHANNEL_NOT_FOUND));
    }

    private WorkspaceChannelEntity getChannel(Long wsId, String channelName) {
        return channelRepository.findByWorkspace_wsIdAndChannelName(wsId, channelName);
    }

    private void publishChannelEvent(WorkspaceEntity workspace, String email, String nickname, String action, String channelName, Long channelNumber) {
        eventPublisher.publishEvent(new WorkspaceChannelEvent(workspace, email, nickname, action, channelName, channelNumber));
    }

    @Override
    @Transactional
    public ChannelDTO createChannel(Long workspaceId, String channelName) {
        String email = AuthUtil.getLoginUserId();
        log.info("📢 채널 생성 요청: workspaceId={}, userEmail={}, channelName={}", workspaceId, email, channelName);

        if (channelRepository.existsByWorkspace_wsIdAndChannelName(workspaceId, channelName)) {
            throw new CustomException(ErrorCode.CHANNEL_ALREADY_EXISTS);
        }

        WorkspaceMemberEntity member = getMember(workspaceId, email);
        WorkspaceChannelEntity channel = channelRepository.save(WorkspaceChannelEntity.builder()
                .workspace(member.getWorkspace())
                .channelName(channelName)
                .build());

        publishChannelEvent(member.getWorkspace(), email, member.getNickname(), "create", channelName, channel.getChannelNumber());

        WorkspaceChannelEntity temp = getChannel(workspaceId,channelName);

        ChannelDTO result = ChannelDTO.builder().channelId(temp.getChannelNumber()).channelName(temp.getChannelName()).build();

        return result;
    }

    @Override
    @Transactional
    public ResultDTO<SuccessDTO> updateChannel(Long channelNumber, ChannelUpdateRequest request) {
        String email = AuthUtil.getLoginUserId();
        log.info("📢 채널 수정 요청: channelNumber={}, userEmail={}", channelNumber, email);

        WorkspaceChannelEntity channel = getChannel(channelNumber);
        WorkspaceEntity workspace = channel.getWorkspace();
        WorkspaceMemberEntity member = getMember(workspace.getWsId(), email);

        if (request.getChannelName() != null && !request.getChannelName().equals(channel.getChannelName())) {
            if (channelRepository.existsByWorkspace_wsIdAndChannelNameAndChannelNumberNot(workspace.getWsId(), request.getChannelName(), channelNumber)) {
                throw new CustomException(ErrorCode.CHANNEL_ALREADY_EXISTS);
            }
            channel.setChannelName(request.getChannelName());
        }

        channelRepository.save(channel);
        publishChannelEvent(workspace, email, member.getNickname(), "update", channel.getChannelName(), channel.getChannelNumber());

        return ResultDTO.of("채널이 성공적으로 수정되었습니다.", SuccessDTO.builder().success(true).build());
    }

    @Override
    @Transactional
    public ResultDTO<SuccessDTO> deleteChannel(Long channelNumber) {
        String email = AuthUtil.getLoginUserId();
        log.info("📢 채널 삭제 요청: channelNumber={}, userEmail={}", channelNumber, email);

        WorkspaceChannelEntity channel = getChannel(channelNumber);
        WorkspaceMemberEntity member = getMember(channel.getWorkspace().getWsId(), email);

        channelRepository.delete(channel);
        publishChannelEvent(channel.getWorkspace(), email, member.getNickname(), "delete", channel.getChannelName(), null);

        return ResultDTO.of("채널이 성공적으로 삭제되었습니다.", SuccessDTO.builder().success(true).build());
    }

    @Override
    public List<WorkspaceChannelLoginStatusDTO> getLoginStatusByRole(Long wsId) {
        return memberRepository.findAllByWorkspace_WsId(wsId).stream()
                .filter(member -> member.getMember() != null)
                .map(member -> new WorkspaceChannelLoginStatusDTO(
                        member.getMember().getEmail(),
                        member.getMember().isLoginStatus(),
                        member.getMember().getLastActiveTime(),
                        member.getMember().getProfileImage()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ChannelDTO> getChannelList(Long wsId) {
        List<ChannelDTO> channelList = new ArrayList<>();
        List<WorkspaceChannelEntity> entities = workspaceChannelRepository.findAllByWorkspace_WsId(wsId);
        entities.forEach(
                entity ->
                        channelList.add(
                            ChannelDTO.builder()
                                    .channelId(entity.getChannelNumber())
                                    .channelName(entity.getChannelName())
                                    .build()
                )
        );
        return channelList;
    }
}