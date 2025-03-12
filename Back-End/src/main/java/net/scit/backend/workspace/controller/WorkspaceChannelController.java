package net.scit.backend.workspace.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.member.dto.MemberLoginStatusDTO;
import net.scit.backend.member.dto.WorkspaceChannelLoginStatusDTO;
import net.scit.backend.workspace.dto.ChannelUpdateRequest;
import net.scit.backend.workspace.entity.WorkspaceChannelRoleEntity;
import net.scit.backend.workspace.repository.WorkspaceChannelRoleRepository;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.service.WorkspaceChannelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
@Slf4j
public class WorkspaceChannelController {

    private final WorkspaceChannelService workspaceChannelService;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceChannelRoleRepository workspaceChannelRoleRepository;

    /**
     * 1. 채널 생성
     */
    @PostMapping("/{ws_id}/channel")
    public ResponseEntity<ResultDTO<SuccessDTO>> createChannel( @PathVariable("ws_id") Long workspaceId,
                                                                @RequestBody Map<String, String> request) {

        String channelName = request.get("channelName");
        Long roleId = Long.parseLong(request.get("roleId"));

        // 서비스 호출
        ResultDTO<SuccessDTO> result = workspaceChannelService.createChannel(workspaceId, channelName, roleId);

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


    /**
     * 특정 채널 역할 번호를 가진 멤버들의 로그인 상태를 조회하는 API
     *
     * @param wsId 워크스페이스 채널 역할 번호
     * @return 해당 역할을 가진 멤버들의 이메일, 로그인 상태, 마지막 활동 시간을 담은 DTO 리스트
     */
    @GetMapping("/login-status")
    public ResponseEntity<ResultDTO<List<WorkspaceChannelLoginStatusDTO>>> getLoginStatusByRole(
            @RequestParam Long wsId) {

        List<WorkspaceChannelLoginStatusDTO> statusList = workspaceChannelService.getLoginStatusByRole(wsId);

        return ResponseEntity.ok(ResultDTO.of("로그인 상태 조회 성공", statusList));
    }

    @GetMapping("/{ws_id}/role")
    public List<WorkspaceChannelRoleEntity> getRole(@PathVariable("ws_id") Long workspaceId)
    {
        return workspaceChannelRoleRepository.findByWorkspace_wsId(workspaceId);
    }
}
