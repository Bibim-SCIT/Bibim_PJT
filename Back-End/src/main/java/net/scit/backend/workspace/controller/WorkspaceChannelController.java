package net.scit.backend.workspace.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import net.scit.backend.member.dto.WorkspaceChannelLoginStatusDTO;
import net.scit.backend.workspace.dto.ChannelDTO;
import net.scit.backend.workspace.dto.ChannelUpdateRequest;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.service.WorkspaceChannelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
@Slf4j
@Tag(name = "워크스페이스 채널 API", description = "워크스페이스 내 채널 생성/수정/삭제 및 멤버 상태 관리")
public class WorkspaceChannelController {

    private final WorkspaceChannelService workspaceChannelService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    /**
     * 1. 채널 생성
     */
    @Operation(summary = "채널 생성", description = "워크스페이스 ID와 채널명을 이용해 새로운 채널을 생성합니다.")
    @PostMapping("/{ws_id}/channel")
    public ChannelDTO createChannel(@PathVariable("ws_id") Long workspaceId,
            @RequestBody Map<String, String> request) {

        String channelName = request.get("channelName");
        // 서비스 호출
        ChannelDTO result = workspaceChannelService.createChannel(workspaceId, channelName);

        return result;
    }

    /**
     * 2. 채널 삭제
     */
    @Operation(summary = "채널 삭제", description = "채널 번호를 이용해 채널을 삭제합니다.")
    @DeleteMapping("/{ws_id}/channel/{channel_number}")
    public ResponseEntity<ResultDTO<SuccessDTO>> deleteChannel(@PathVariable("channel_number") Long channelNumber) {
        log.info("채널 삭제 요청: channelId={}", channelNumber);

        ResultDTO<SuccessDTO> result = workspaceChannelService.deleteChannel(channelNumber);
        return ResponseEntity.ok(result);
    }

    /**
     * 3. 채널 수정(역할, 이름만)
     */
    @Operation(summary = "채널 수정", description = "채널 번호와 수정 정보를 이용해 채널의 이름 및 역할을 수정합니다.")
    @PutMapping("/{ws_id}/channel/{channel_number}")
    public ResponseEntity<ResultDTO<SuccessDTO>> updateChannel(@PathVariable("channel_number") Long channelNumber,
            @RequestBody ChannelUpdateRequest request) {
        log.info("채널 수정 요청: channelNumber={}, channelName={}", channelNumber, request.getChannelName());

        ResultDTO<SuccessDTO> result = workspaceChannelService.updateChannel(channelNumber, request);
        return ResponseEntity.ok(result);
    }

    /**
     * 특정 채널 역할 번호를 가진 멤버들의 로그인 상태를 조회하는 API
     *
     * @param wsId 워크스페이스 채널 역할 번호
     * @return 해당 역할을 가진 멤버들의 이메일, 로그인 상태, 마지막 활동 시간을 담은 DTO 리스트
     */
    @Operation(summary = "채널별 로그인 상태 조회", description = "워크스페이스 ID를 기준으로 멤버들의 로그인 상태를 조회합니다.")
    @GetMapping("/login-status")
    public ResponseEntity<ResultDTO<List<WorkspaceChannelLoginStatusDTO>>> getLoginStatusByRole(
            @RequestParam Long wsId) {

        List<WorkspaceChannelLoginStatusDTO> statusList = workspaceChannelService.getLoginStatusByRole(wsId);

        return ResponseEntity.ok(ResultDTO.of("로그인 상태 조회 성공", statusList));
    }

    /**
     * 지정된 워크스페이스와 연관된 모든 채널 목록을 조회합니다.
     *
     * @param ws_Id 채널 목록을 조회할 워크스페이스의 ID입니다.
     * @return 지정된 워크스페이스의 채널을 나타내는 ChannelDTO 객체 리스트입니다.
     */
    @Operation(summary = "워크스페이스 채널 목록 조회", description = "워크스페이스 ID로 채널 목록을 조회합니다.")
    @GetMapping("/{ws_id}/channel")
    public List<ChannelDTO> getChannelList(@PathVariable("ws_id") Long workspaceId) {
        return workspaceChannelService.getChannelList(workspaceId);
    }

    // @GetMapping("/{ws_id}/channel")
    // public List<ChannelDTO> getChannelList(@PathVariable Long ws_Id)
    // {
    // return workspaceChannelService.getChannelList(ws_Id);
    // }

}
