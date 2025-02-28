package net.scit.backend.workspace.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.service.WorkspaceChannelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace/{ws_id}/channel")
@Slf4j
public class WorkspaceChannelController {

    private final WorkspaceChannelService workspaceChannelService;

    /**
     * 채널 생성
     */
    @PostMapping("")
    public ResponseEntity<ResultDTO<SuccessDTO>> createChannel(@PathVariable("ws_id") Long workspaceId,
                                                               @RequestParam String channelName) {
        log.info("채널 생성 요청: workspaceId={}, channelName={}", workspaceId, channelName);

        // 서비스 호출 (로그인된 사용자 정보는 서비스 내부에서 가져옴)
        ResultDTO<SuccessDTO> result = workspaceChannelService.createChannel(workspaceId, channelName);

        return ResponseEntity.ok(result);
    }
}
