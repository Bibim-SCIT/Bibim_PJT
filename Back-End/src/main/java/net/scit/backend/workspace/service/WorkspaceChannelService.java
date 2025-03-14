package net.scit.backend.workspace.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.MemberLoginStatusDTO;
import net.scit.backend.member.dto.WorkspaceChannelLoginStatusDTO;
import net.scit.backend.workspace.dto.ChannelDTO;
import net.scit.backend.workspace.dto.ChannelUpdateRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface WorkspaceChannelService {
    // 1. 채널 생성
    ChannelDTO createChannel(Long workspaceId, String channelName);

    // 2. 채널 삭제
    ResultDTO<SuccessDTO> deleteChannel(Long channelNumber);

    // 3. 채널 수정
    ResultDTO<SuccessDTO> updateChannel(Long channelNumber, ChannelUpdateRequest request);

    List<WorkspaceChannelLoginStatusDTO> getLoginStatusByRole(Long chRoleNumber);

    List<ChannelDTO> getChannelList(Long wsId);
}
