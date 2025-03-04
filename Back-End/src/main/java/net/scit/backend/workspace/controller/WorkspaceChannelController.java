package net.scit.backend.workspace.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.dto.ChannelUpdateRequest;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.service.WorkspaceChannelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
@Slf4j
public class WorkspaceChannelController {

    private final WorkspaceChannelService workspaceChannelService;

    /**
     * 1. 채널 생성
     */
    @PostMapping("/{ws_id}/channel")
    public ResponseEntity<ResultDTO<SuccessDTO>> createChannel( @PathVariable("ws_id") Long workspaceId,
                                                                @RequestBody Map<String, String> request) {

        String channelName = request.get("channelName");

        // 서비스 호출
        ResultDTO<SuccessDTO> result = workspaceChannelService.createChannel(workspaceId, channelName);

        return ResponseEntity.ok(result);
    }

    /**
     * 2. 채널 삭제
     */
    @DeleteMapping("/{ws_id}/channel/{channel_number}")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteChannel(@PathVariable("channel_number") Long channelNumber) {
        log.info("채널 삭제 요청: channelId={}", channelNumber);

        ResultDTO<SuccessDTO> result = workspaceChannelService.deleteChannel(channelNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 3. 채널 수정(역할, 이름만)
     */
    @PutMapping("/{ws_id}/channel/{channel_number}")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateChannel( @PathVariable("channel_number") Long channelNumber,
                                                                @RequestBody ChannelUpdateRequest request) {
        log.info("채널 수정 요청: channelNumber={}, channelName={}, workspaceRole={}", channelNumber, request.getChannelName(), request.getWorkspaceRole());

        ResultDTO<SuccessDTO> result = workspaceChannelService.updateChannel(channelNumber, request);
        return ResponseEntity.ok(result);
    }

}
