package net.scit.backend.mypage.service.impl;

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
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final MemberRepository memberRepository;
    private final ScheduleRepository scheduleRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkdataRepository workdataRepository;

    @Override
    public ResultDTO<List<MyScheduleDTO>> getSchedule() {

        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        List<ScheduleEntity> scheduleEntityList = scheduleRepository.findAllByMember(member);
        List<MyScheduleDTO> myScheduleDTOList = new ArrayList<>();

        for (ScheduleEntity scheduleEntity : scheduleEntityList) {
            MyScheduleDTO myScheduleDTO = MyScheduleDTO.builder()
                    .wsId(scheduleEntity.getWorkspace().getWsId())
                    .wsName(scheduleEntity.getWorkspace().getWsName())
                    .scheduleNumber(scheduleEntity.getScheduleNumber())
                    .tag1(scheduleEntity.getScheduleTag().getLargeTag().getTagName())
                    .tag2(scheduleEntity.getScheduleTag().getMediumTag().getTagName())
                    .tag3(scheduleEntity.getScheduleTag().getSmallTag().getTagName())
                    .scheduleTitle(scheduleEntity.getScheduleTitle())
                    .scheduleContent(scheduleEntity.getScheduleContent())
                    .scheduleStatus(scheduleEntity.getScheduleStatus())
                    .scheduleStartDate(scheduleEntity.getScheduleStartdate())
                    .scheduleFinishDate(scheduleEntity.getScheduleFinishdate())
                    .scheduleModifytime(scheduleEntity.getScheduleModifytime())
                    .color(scheduleEntity.getScheduleTag().getLargeTag().getTagColor())
                    .build();

            myScheduleDTOList.add(myScheduleDTO);
        }

        return ResultDTO.of("나의 전체 스케줄 불러오기에 성공했습니다.", myScheduleDTOList);
    }

    @Override
    public ResultDTO<List<AllWorkspaceDataDTO>> getWorkData() {

        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 내가 속한 워크스페이스 받아오기
        List<WorkspaceMemberEntity> workspaceMemberEntities = workspaceMemberRepository.findByMember(member);
        List<WorkspaceEntity> workspaceEntities = workspaceMemberEntities.stream()
                .map(WorkspaceMemberEntity::getWorkspace).collect(Collectors.toList());

        // 워크스페이스 목록을 기반으로 해당 워크스페이스의 자료실 데이터 가져오기
        List<WorkdataEntity> workDataEntities = workdataRepository.findAllByWorkspaceIn(workspaceEntities);

        if (workDataEntities == null || workDataEntities.isEmpty()) {
            return ResultDTO.of("등록 된 자료실 정보가 없습니다.", null);
        }

        List<AllWorkspaceDataDTO> allWorkspaceDataDTOList = workDataEntities.stream()
                .map(AllWorkspaceDataDTO::toDTO)
                .toList();

        return ResultDTO.of("내가 가입한 모든 워크스페이스의 자료실 정보 가져오기에 성공했습니다.", allWorkspaceDataDTOList);
    }
}
