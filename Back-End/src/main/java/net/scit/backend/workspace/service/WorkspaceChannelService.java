package net.scit.backend.workspace.service;

import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import org.springframework.stereotype.Service;

@Service
public interface WorkspaceChannelService {
    // 1. 채널 생성
    ResultDTO<SuccessDTO> createChannel(Long workspaceId, String channelName);
}
