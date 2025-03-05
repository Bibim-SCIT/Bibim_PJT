package net.scit.backend.workspace.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.ChannelUpdateRequest;
import org.springframework.stereotype.Service;

@Service
public interface WorkspaceChannelService {
    // 1. 채널 생성
    ResultDTO<SuccessDTO> createChannel(Long workspaceId, String channelName);

    // 2. 채널 삭제
    ResultDTO<SuccessDTO> deleteChannel(Long channelNumber);

    // 3. 채널 수정
    ResultDTO<SuccessDTO> updateChannel(Long channelNumber, ChannelUpdateRequest request);
}
