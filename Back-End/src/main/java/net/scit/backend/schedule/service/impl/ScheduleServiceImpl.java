package net.scit.backend.schedule.service.impl;

import lombok.RequiredArgsConstructor;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.schedule.dto.ScheduleDTO;
import net.scit.backend.schedule.entity.*;
import net.scit.backend.schedule.repository.*;
import net.scit.backend.schedule.service.ScheduleService;
import net.scit.backend.schedule.type.ScheduleStatus;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final MemberRepository memberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final LargeTagRepository largeTagRepository;
    private final MediumTagRepository mediumTagRepository;
    private final SmallTagRepository smallTagRepository;
    private final ScheduleTagRepository scheduleTagRepository;

    @Transactional
    @Override
    public ResultDTO<SuccessDTO> scheduleRegist(ScheduleDTO scheduleDTO) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        Optional<WorkspaceEntity> byId = workspaceRepository.findById(scheduleDTO.getWsId());
        if (byId.isEmpty()) {
            throw new CustomException(ErrorCode.WORKSPACE_NOT_FOUND);
        }
        WorkspaceEntity workspace = byId.get();

        Optional<WorkspaceMemberEntity> byWorkspaceAndMember = workspaceMemberRepository.findByWorkspaceAndMember(workspace, member);
        if (byWorkspaceAndMember.isEmpty()) {
            throw new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
        }

        // 스케쥴 등록
        ScheduleEntity scheduleEntity = ScheduleEntity.toEntity(scheduleDTO, member, workspace, ScheduleStatus.UNASSIGNED);
        scheduleRepository.save(scheduleEntity);

        // 태그 등록
        // 대분류가 있을 때만 등록
        if (!scheduleDTO.getTag1().isEmpty()) {
            String largeTagName = scheduleDTO.getTag1();
            LargeTagEntity largeTagEntity = largeTagRepository.findByTagName(largeTagName)
                    .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

            // 중분류는 없는데 소분류는 있을 때 exception
            if (scheduleDTO.getTag2().isEmpty() && !scheduleDTO.getTag3().isEmpty()) {
                throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
            }

            // 중분류 있을 때
            MediumTagEntity mediumTagEntity = null;
            if (!scheduleDTO.getTag2().isEmpty()) {
                String mediumTagName = scheduleDTO.getTag2();
                mediumTagEntity = mediumTagRepository.findByTagName(mediumTagName)
                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
            }

            // 소분류 있을 때
            SmallTagEntity smallTagEntity = null;
            if (!scheduleDTO.getTag3().isEmpty()) {
                String smallTagName = scheduleDTO.getTag3();
                smallTagEntity = smallTagRepository.findByTagName(smallTagName)
                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
            }

            ScheduleTagEntity scheduleTagEntity = ScheduleTagEntity.builder()
                    .schedule(scheduleEntity)
                    .largeTag(largeTagEntity)
                    .mediumTag(mediumTagEntity)
                    .smallTag(smallTagEntity)
                    .build();
            scheduleTagRepository.save(scheduleTagEntity);
        }

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("스케쥴 등록에 성공 했습니다.", successDTO);
    }
}
