package net.scit.backend.mypage.service.impl;

import java.util.*;
import java.util.stream.Collectors;

import net.scit.backend.schedule.entity.ScheduleTagEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.jwt.AuthUtil;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.mypage.dto.AllWorkspaceDataDTO;
import net.scit.backend.mypage.dto.MyScheduleDTO;
import net.scit.backend.mypage.service.MyPageService;
import net.scit.backend.schedule.entity.ScheduleEntity;
import net.scit.backend.schedule.repository.ScheduleRepository;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.repository.WorkdataRepository;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;

import org.springframework.util.CollectionUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final MemberRepository memberRepository;
    private final ScheduleRepository scheduleRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkdataRepository workdataRepository;

    /**
     * 내 스케줄을 조회하는 메서드
     *
     * @return 내 스케줄 목록
     */
    @Override
    public ResultDTO<List<MyScheduleDTO>> getSchedule() {
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        List<ScheduleEntity> scheduleEntityList = scheduleRepository.findAllByMember(member);
        List<MyScheduleDTO> myScheduleDTOList = new ArrayList<>();

        // 스케줄에 관련된 태그 가져오기 및 맵으로 변환
        Map<Long, ScheduleTagEntity> scheduleTagMap = scheduleEntityList.stream()
                .map(ScheduleEntity::getScheduleTag)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        ScheduleTagEntity::getScheduleTagNumber,
                        tag -> tag,
                        (existing, replacement) -> existing));

        for (ScheduleEntity scheduleEntity : scheduleEntityList) {
            MyScheduleDTO.MyScheduleDTOBuilder dtoBuilder = MyScheduleDTO.builder()
                    .wsId(scheduleEntity.getWorkspace().getWsId())
                    .wsName(scheduleEntity.getWorkspace().getWsName())
                    .scheduleNumber(scheduleEntity.getScheduleNumber())
                    .scheduleTitle(scheduleEntity.getScheduleTitle())
                    .scheduleContent(scheduleEntity.getScheduleContent())
                    .scheduleStatus(scheduleEntity.getScheduleStatus())
                    .scheduleStartDate(scheduleEntity.getScheduleStartdate())
                    .scheduleFinishDate(scheduleEntity.getScheduleFinishdate())
                    .scheduleModifytime(scheduleEntity.getScheduleModifytime())
                    .color("#DBE2EF"); // 기본 색상

            ScheduleTagEntity scheduleTagEntity = scheduleTagMap.get(scheduleEntity.getScheduleTag().getScheduleTagNumber());
            if (scheduleTagEntity != null) {
                if (scheduleTagEntity.getLargeTag() != null) {
                    dtoBuilder.tag1(scheduleTagEntity.getLargeTag().getTagName());
                    dtoBuilder.color(scheduleTagEntity.getLargeTag().getTagColor());
                }
                if (scheduleTagEntity.getMediumTag() != null) {
                    dtoBuilder.tag2(scheduleTagEntity.getMediumTag().getTagName());
                }
                if (scheduleTagEntity.getSmallTag() != null) {
                    dtoBuilder.tag3(scheduleTagEntity.getSmallTag().getTagName());
                }
            }

            myScheduleDTOList.add(dtoBuilder.build());
        }
        return ResultDTO.of("나의 전체 스케줄 불러오기에 성공했습니다.", myScheduleDTOList);
    }

    /**
     * 내가 가입한 모든 워크스페이스의 자료실 데이터 조회
     *
     * @return 모든 워크스페이스의 자료실 데이터 목록
     */
    @Override
    public ResultDTO<List<AllWorkspaceDataDTO>> getWorkData() {
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        List<WorkspaceEntity> workspaceEntities = workspaceMemberRepository.findByMember(member).stream()
                .map(WorkspaceMemberEntity::getWorkspace)
                .collect(Collectors.toList());

        List<WorkdataEntity> workDataEntities = workdataRepository.findAllByWorkspaceIn(workspaceEntities);

        if (CollectionUtils.isEmpty(workDataEntities)) {
            return ResultDTO.of("등록 된 자료실 정보가 없습니다.", null);
        }

        List<AllWorkspaceDataDTO> allWorkspaceDataDTOList = workDataEntities.stream()
                .map(AllWorkspaceDataDTO::toDTO)
                .collect(Collectors.toList());

        return ResultDTO.of("내가 가입한 모든 워크스페이스의 자료실 정보 가져오기에 성공했습니다.", allWorkspaceDataDTOList);
    }
}
