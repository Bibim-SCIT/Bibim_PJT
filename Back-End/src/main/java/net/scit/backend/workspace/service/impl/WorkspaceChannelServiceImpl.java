package net.scit.backend.workspace.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.dto.MemberLoginStatusDTO;
import net.scit.backend.member.dto.WorkspaceChannelLoginStatusDTO;
import net.scit.backend.member.entity.MemberEntity;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceChannelServiceImpl implements WorkspaceChannelService {

    private final WorkspaceChannelRepository workspaceChannelRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 1️⃣ 채널 생성
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> createChannel(Long workspaceId, String channelName) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("📢 채널 생성 요청: workspaceId={}, userEmail={}, channelName={}", workspaceId, userEmail, channelName);

        // 1. 채널 중복 검사
        if (workspaceChannelRepository.existsByWorkspace_wsIdAndChannelName(workspaceId, channelName)) {
            throw new CustomException(ErrorCode.CHANNEL_ALREADY_EXISTS);
        }

        // 2. 사용자 정보 조회 (닉네임 포함)
        WorkspaceMemberEntity member = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(workspaceId, userEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 3. 채널 저장
        WorkspaceChannelEntity channel = WorkspaceChannelEntity.builder()
                .workspace(member.getWorkspace())
                .channelName(channelName)
                .build();
        workspaceChannelRepository.save(channel);

        log.info("✅ 채널 생성 완료: channelName={}, workspaceId={}", channelName, workspaceId);

        // 4. 채널 생성 이벤트 발행 (🔔 알림)
        eventPublisher.publishEvent(new WorkspaceChannelEvent(
                member.getWorkspace(), userEmail, member.getNickname(),
                "create", channelName, channel.getChannelNumber()
        ));

        return ResultDTO.of("채널이 성공적으로 생성되었습니다.", SuccessDTO.builder().success(true).build());
    }

    /**
     * 2️⃣ 채널 수정 (채널 이름 변경)
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> updateChannel(Long channelNumber, ChannelUpdateRequest request) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("📢 채널 수정 요청: channelNumber={}, userEmail={}", channelNumber, userEmail);

        // 1. 채널 정보 조회
        WorkspaceChannelEntity channel = workspaceChannelRepository.findById(channelNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.CHANNEL_NOT_FOUND));
        WorkspaceEntity workspace = channel.getWorkspace();
        Long wsId = workspace.getWsId();

        // 2. 사용자 정보 조회
        WorkspaceMemberEntity member = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, userEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 3. 채널 이름 수정 로직
        String newName = request.getChannelName();
        if (newName != null && !newName.isBlank()) {
            // (1) 기존 채널명과 다른 경우만 검사
            if (!newName.equals(channel.getChannelName())) {
                // (2) 동일 워크스페이스 내, 다른 채널 번호에 같은 이름이 있는지 체크
                boolean nameExists = workspaceChannelRepository
                        .existsByWorkspace_wsIdAndChannelNameAndChannelNumberNot(wsId, newName, channelNumber);
                if (nameExists) {
                    throw new CustomException(ErrorCode.CHANNEL_ALREADY_EXISTS);
                }
                // (3) 중복이 없다면 채널명 수정
                channel.setChannelName(newName);
            }
        }

        // DB 반영
        workspaceChannelRepository.save(channel);
        log.info("✅ 채널 수정 완료: channelNumber={}, channelName={}", channelNumber, channel.getChannelName());

        // 5. 채널 수정 이벤트 발행 (🔔 알림)
        eventPublisher.publishEvent(new WorkspaceChannelEvent(
                workspace, userEmail, member.getNickname(),
                "update", channel.getChannelName(), channel.getChannelNumber()
        ));

        return ResultDTO.of("채널이 성공적으로 수정되었습니다.", SuccessDTO.builder().success(true).build());
    }


    /**
     * 3️⃣ 채널 삭제
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> deleteChannel(Long channelNumber) {
        String userEmail = AuthUtil.getLoginUserId();
        log.info("📢 채널 삭제 요청: channelNumber={}, userEmail={}", channelNumber, userEmail);

        // 1. 채널 정보 조회
        WorkspaceChannelEntity channel = workspaceChannelRepository.findById(channelNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.CHANNEL_NOT_FOUND));
        WorkspaceEntity workspace = channel.getWorkspace();

        // 2. 사용자 정보 조회
        WorkspaceMemberEntity member = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(workspace.getWsId(), userEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 3. 채널 삭제
        workspaceChannelRepository.delete(channel);
        log.info("✅ 채널 삭제 완료: channelNumber={}", channelNumber);

        // 4. 채널 삭제 이벤트 발행 (🔔 알림)
        eventPublisher.publishEvent(new WorkspaceChannelEvent(
                workspace, userEmail, member.getNickname(),
                "delete", channel.getChannelName(), null
        ));

        return ResultDTO.of("채널이 성공적으로 삭제되었습니다.", SuccessDTO.builder().success(true).build());
    }


    /**
     * 지정된 채널 역할 번호(ch_role_number)를 가진 워크스페이스 멤버들의 로그인 상태 정보를 조회합니다.
     * WorkspaceMemberEntity는 MemberEntity를 참조하는 외래키를 보유하므로, 연관된 회원의 로그인 상태를 함께 반환합니다.
     *
     * @param chRoleNumber 워크스페이스 채널 역할 번호 (예: 1, 2, 3 등)
     * @return 해당 역할을 가진 회원들의 이메일, 로그인 상태, 마지막 활동 시간 정보를 담은 DTO 리스트
     */
    @Override
    public List<WorkspaceChannelLoginStatusDTO> getLoginStatusByRole(Long chRoleNumber) {
        // 입력값 검증: chRoleNumber가 null인 경우 빈 리스트 반환
        if (chRoleNumber == null) {
            return Collections.emptyList();
        }

        // chRoleNumber를 기준으로 워크스페이스 멤버 조회
        // (Repository에 아래와 같은 메서드가 정의되어 있어야 합니다.
        //  List<WorkspaceMemberEntity> findByChRoleNumber_ChRoleNumber(Long chRoleNumber);)
        List<WorkspaceMemberEntity> workspaceMembers =
                workspaceMemberRepository.findByChRoleNumber_ChRoleNumber(chRoleNumber);

        // 조회 결과가 없으면 빈 리스트 반환
        if (workspaceMembers == null || workspaceMembers.isEmpty()) {
            return Collections.emptyList();
        }

        // Member의 로그인 상태 정보를 추출하여 DTO 리스트 생성
        List<WorkspaceChannelLoginStatusDTO> statusDTOList = new ArrayList<>();
        for (WorkspaceMemberEntity workspaceMember : workspaceMembers) {
            MemberEntity member = workspaceMember.getMember();
            if (member != null) {
                statusDTOList.add(new WorkspaceChannelLoginStatusDTO(
                        member.getEmail(),
                        member.isLoginStatus(),
                        member.getLastActiveTime(),
                        member.getProfileImage()
                ));
            }
        }
        return statusDTOList;
    }
}
