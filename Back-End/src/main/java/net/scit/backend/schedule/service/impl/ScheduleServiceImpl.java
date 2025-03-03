package net.scit.backend.schedule.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.schedule.dto.*;
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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
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

    /**
     * 새로운 스케줄 생성
     *
     * @param scheduleDTO // 스케줄 DTO
     * @return 메시지와 성공여부
     */
    @Transactional
    @Override
    public ResultDTO<SuccessDTO> createSchedule(ScheduleDTO scheduleDTO) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 워크스페이스 식별자로 워크스페이스 정보 가져오기
        WorkspaceEntity workspace = workspaceRepository.findById(scheduleDTO.getWsId())
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 스케쥴 등록
        ScheduleEntity scheduleEntity = ScheduleEntity.toEntity(scheduleDTO, workspace, ScheduleStatus.UNASSIGNED);
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

    /**
     * 워크스페이스의 모든 스케줄 정보 가져오기
     *
     * @param wsId // 워크스페이스 식별자
     * @return 메시지와 해당 워크스페이스의 스케줄 리스트
     */
    @Override
    public ResultDTO<List<ScheduleDTO>> getSchedules(Long wsId) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 워크스페이스 식별자로 워크스페이스 정보 가져오기
        WorkspaceEntity workspace = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 워크스페이스 내 모든 멤버의 닉네임을 한 번에 가져오기
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace(workspace);
        Map<String, String> memberNicknames = workspaceMembers.stream()
                .collect(Collectors.toMap(
                        wm -> wm.getMember().getEmail(),  // 멤버의 이메일을 ID로 사용
                        WorkspaceMemberEntity::getNickname));

        // 해당 워크스페이스의 전체 스케줄 정보 가져오기
        List<ScheduleEntity> schedules = scheduleRepository.findAllByWorkspace(workspace);

        // 스케줄에 관련된 태그를 미리 가져오기
        List<ScheduleTagEntity> scheduleTags = scheduleTagRepository.findBySchedules(schedules);

        List<ScheduleDTO> scheduleDTOList = schedules.stream()
                .map(scheduleEntity -> {
                    // 해당 스케줄의 담당자의 이메일로 닉네임을 가져오기
                    String nickname;
                    if (scheduleEntity.getMember() != null) {
                        nickname = memberNicknames.get(scheduleEntity.getMember().getEmail());
                    } else {
                        nickname = null;
                    }

                    // 해당 스케줄의 태그를 미리 가져오기
                    Optional<ScheduleTagEntity> scheduleTagOptional = scheduleTags.stream()
                            .filter(tag -> tag.getSchedule().equals(scheduleEntity))
                            .findFirst();

                    // 태그가 없을 때, 있으 때 ScheduleTagEntity 반환
                    return scheduleTagOptional
                            .map(scheduleTagEntity -> ScheduleDTO.toDTO(scheduleEntity, nickname, scheduleTagEntity))
                            .orElseGet(() -> ScheduleDTO.toDTO(scheduleEntity, nickname));
                })
                .collect(Collectors.toList());

        return ResultDTO.of("팀 스케줄 리스트를 불러 왔습니다.", scheduleDTOList);
    }

    /**
     * 특정 스케줄의 정보
     *
     * @param scheduleNumber // 스케줄 식별자
     * @return 메시지와 특정 스케줄의 정보
     */
    @Override
    public ResultDTO<ScheduleDTO> getSchedule(Long scheduleNumber) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 스케줄 식별자로 특정 스케줄 정보 가져오기
        ScheduleEntity scheduleEntity = scheduleRepository.findByScheduleNumber(scheduleNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));

        WorkspaceEntity workspace = scheduleEntity.getWorkspace();

        // 사용자가 속한 워크스페이스인지 확인하기
        workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));


        // 담당자 찾아오기
        String nickname = workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .map(WorkspaceMemberEntity::getNickname)
                .orElse(null);


        // 해당 스케줄의 태그 가져오기
        ScheduleDTO scheduleDTO = scheduleTagRepository.findBySchedule(scheduleEntity)
                .map(scheduleTagEntity -> ScheduleDTO.toDTO(scheduleEntity, nickname, scheduleTagEntity))
                .orElseGet(() -> ScheduleDTO.toDTO(scheduleEntity, nickname));

        return ResultDTO.of("스케줄 상세 조회에 성공했습니다.", scheduleDTO);
    }

    /**
     * 스케줄 담당자 지정
     *
     * @param scheduleNumber // 스케줄 식별자
     * @return 메시지와 성공여부
     */
    @Override
    public ResultDTO<SuccessDTO> assignSchedule(Long scheduleNumber) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 스케줄 식별자로 특정 스케줄 정보 가져오기
        ScheduleEntity scheduleEntity = scheduleRepository.findByScheduleNumber(scheduleNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));
        WorkspaceEntity workspace = scheduleEntity.getWorkspace();

        // 해당 워크스페이스 멤버인지 확인
        workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        scheduleEntity.setMember(member);
        scheduleRepository.save(scheduleEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("해당 스케줄 담당에 성공했습니다.", successDTO);
    }

    /**
     * 스케줄 상태 수정
     *
     * @param scheduleNumber // 스케줄 식별자
     * @param status         // 스케줄 상태 번호
     * @return 메시지와 성공여부
     */
    @Override
    public ResultDTO<SuccessDTO> changeScheduleStatus(Long scheduleNumber, char status) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 스케줄 식별자로 특정 스케줄 정보 가져오기
        ScheduleEntity scheduleEntity = scheduleRepository.findByScheduleNumber(scheduleNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));
        WorkspaceEntity workspace = scheduleEntity.getWorkspace();

        // 해당 워크스페이스 멤버인지 확인
        workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 해당 스케줄의 담당자인지 확인
        MemberEntity scheduleMember = scheduleEntity.getMember();
        if (!scheduleMember.equals(member)) {
            throw new CustomException(ErrorCode.INVALID_SCHEDULE_MEMBER);
        }

        scheduleEntity.setScheduleStatus(ScheduleStatus.fromCode(status));
        // 상태를 미배정으로 바꾸면 담당자는 자동으로 해지됨
        if (status == '1') {
            scheduleEntity.setMember(null);
        }
        scheduleRepository.save(scheduleEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("해당 스케줄 상태 변경에 성공했습니다.", successDTO);
    }

    /**
     * 스케줄 정보 수정
     *
     * @param scheduleNumber    // 스케줄 식별자
     * @param changeScheduleDTO // 수정하려는 스케줄 정보
     * @return 메시지와 성공여부
     */
    @Transactional
    @Override
    public ResultDTO<SuccessDTO> changeSchedule(Long scheduleNumber, ChangeScheduleDTO changeScheduleDTO) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 스케줄 식별자로 특정 스케줄 정보 가져오기
        ScheduleEntity scheduleEntity = scheduleRepository.findByScheduleNumber(scheduleNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));

        WorkspaceEntity workspace = scheduleEntity.getWorkspace();

        // 해당 워크스페이스 멤버인지 확인
        WorkspaceMemberEntity workspaceMemberEntity = workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 담당자 혹은 권한이 오너인지 확인
        MemberEntity scheduleMemnber = scheduleEntity.getMember();
        boolean isOwner = "owner".equals(workspaceMemberEntity.getWsRole());

        if (scheduleMemnber == null) {
            // 담당자가 없으면 오너 권한만 체크
            if (!isOwner) {
                throw new CustomException(ErrorCode.INVALID_SCHEDULE_MEMBER);
            }
        } else {
            // 담당자가 있을 경우, 담당자이거나 오너여야 함
            if (!scheduleMemnber.equals(member) && !isOwner) {
                throw new CustomException(ErrorCode.INVALID_SCHEDULE_MEMBER);
            }
        }

//        Optional<ScheduleTagEntity> bySchedule = scheduleTagRepository.findBySchedule(scheduleEntity);
//        if (bySchedule.isPresent()) {
//            ScheduleTagEntity scheduleTagEntity = bySchedule.get();
//
//            // 태그 계층 구조 검사
//            // 대분류가 있을 때
//            if (!changeScheduleDTO.getTag1().isEmpty()) {
//                String largeTagName = changeScheduleDTO.getTag1();
//                LargeTagEntity largeTagEntity = largeTagRepository.findByTagName(largeTagName)
//                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
//
//                // 중분류는 없지만 소분류가 있을 때
//                if (changeScheduleDTO.getTag2().isEmpty() && !changeScheduleDTO.getTag3().isEmpty()) {
//                    throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
//                }
//
//                // 중분류가 있을 때와 없을 때
//                MediumTagEntity mediumTagEntity = changeScheduleDTO.getTag2().isEmpty() ? null :
//                        mediumTagRepository.findByTagName(changeScheduleDTO.getTag2())
//                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
//
//                // 소분류가 있을 때와 없을 때
//                SmallTagEntity smallTagEntity = changeScheduleDTO.getTag3().isEmpty() ? null :
//                        smallTagRepository.findByTagName(changeScheduleDTO.getTag3())
//                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
//
//                ScheduleTagEntity updateTagEntity = scheduleTagEntity.toBuilder()
//                        .largeTag(largeTagEntity)
//                        .mediumTag(mediumTagEntity)
//                        .smallTag(smallTagEntity)
//                        .build();
//
//                scheduleTagRepository.save(updateTagEntity);
//            } else {
//                if (!changeScheduleDTO.getTag2().isEmpty() || !changeScheduleDTO.getTag3().isEmpty()) {
//                    throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
//                }
//
//                scheduleTagRepository.delete(scheduleTagEntity);
//            }
//        } else {
//            // scheduleTagEntity가 존재하지 않을 때 실행
//            if (!changeScheduleDTO.getTag1().isEmpty()) {
//                String largeTagName = changeScheduleDTO.getTag1();
//                LargeTagEntity largeTagEntity = largeTagRepository.findByTagName(largeTagName)
//                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
//
//                // 중분류는 없지만 소분류가 있을 때
//                if (changeScheduleDTO.getTag2().isEmpty() && !changeScheduleDTO.getTag3().isEmpty()) {
//                    throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
//                }
//
//                // 중분류가 있을 때와 없을 때
//                MediumTagEntity mediumTagEntity = changeScheduleDTO.getTag2().isEmpty() ? null :
//                        mediumTagRepository.findByTagName(changeScheduleDTO.getTag2())
//                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
//
//                // 소분류가 있을 때와 없을 때
//                SmallTagEntity smallTagEntity = changeScheduleDTO.getTag3().isEmpty() ? null :
//                        smallTagRepository.findByTagName(changeScheduleDTO.getTag3())
//                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));
//
//                ScheduleTagEntity newTagEntity = ScheduleTagEntity.builder()
//                        .schedule(scheduleEntity)
//                        .largeTag(largeTagEntity)
//                        .mediumTag(mediumTagEntity)
//                        .smallTag(smallTagEntity)
//                        .build();
//
//                scheduleTagRepository.save(newTagEntity);
//
//            } else {
//                if (!changeScheduleDTO.getTag2().isEmpty() || !changeScheduleDTO.getTag3().isEmpty()) {
//                    throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
//                }
//            }
//        }

        scheduleTagRepository.findBySchedule(scheduleEntity).ifPresentOrElse(scheduleTagEntity -> {
                    // 태그 계층 구조 검사
                    // 대분류가 있을 때
                    if (!changeScheduleDTO.getTag1().isEmpty()) {
                        String largeTagName = changeScheduleDTO.getTag1();
                        LargeTagEntity largeTagEntity = largeTagRepository.findByTagName(largeTagName)
                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

                        // 중분류는 없지만 소분류가 있을 때
                        if (changeScheduleDTO.getTag2().isEmpty() && !changeScheduleDTO.getTag3().isEmpty()) {
                            throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
                        }

                        // 중분류가 있을 때와 없을 때
                        MediumTagEntity mediumTagEntity = changeScheduleDTO.getTag2().isEmpty() ? null :
                                mediumTagRepository.findByTagName(changeScheduleDTO.getTag2())
                                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

                        // 소분류가 있을 때와 없을 때
                        SmallTagEntity smallTagEntity = changeScheduleDTO.getTag3().isEmpty() ? null :
                                smallTagRepository.findByTagName(changeScheduleDTO.getTag3())
                                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

                        ScheduleTagEntity updateTagEntity = scheduleTagEntity.toBuilder()
                                .scheduleTagNumber(scheduleTagEntity.getScheduleTagNumber())
                                .schedule(scheduleEntity)
                                .largeTag(largeTagEntity)
                                .mediumTag(mediumTagEntity)
                                .smallTag(smallTagEntity)
                                .build();

                        scheduleTagRepository.save(updateTagEntity);
                    } else {
                        if (!changeScheduleDTO.getTag2().isEmpty() || !changeScheduleDTO.getTag3().isEmpty()) {
                            throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
                        }

                        scheduleTagRepository.delete(scheduleTagEntity);
                    }
                },
                () -> {
                    // scheduleTagEntity가 존재하지 않을 때 실행
                    if (!changeScheduleDTO.getTag1().isEmpty()) {
                        String largeTagName = changeScheduleDTO.getTag1();
                        LargeTagEntity largeTagEntity = largeTagRepository.findByTagName(largeTagName)
                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

                        // 중분류는 없지만 소분류가 있을 때
                        if (changeScheduleDTO.getTag2().isEmpty() && !changeScheduleDTO.getTag3().isEmpty()) {
                            throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
                        }

                        // 중분류가 있을 때와 없을 때
                        MediumTagEntity mediumTagEntity = changeScheduleDTO.getTag2().isEmpty() ? null :
                                mediumTagRepository.findByTagName(changeScheduleDTO.getTag2())
                                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

                        // 소분류가 있을 때와 없을 때
                        SmallTagEntity smallTagEntity = changeScheduleDTO.getTag3().isEmpty() ? null :
                                smallTagRepository.findByTagName(changeScheduleDTO.getTag3())
                                        .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

                        ScheduleTagEntity newTagEntity = ScheduleTagEntity.builder()
                                .schedule(scheduleEntity)
                                .largeTag(largeTagEntity)
                                .mediumTag(mediumTagEntity)
                                .smallTag(smallTagEntity)
                                .build();

                        scheduleTagRepository.save(newTagEntity);

                    } else {
                        if (!changeScheduleDTO.getTag2().isEmpty() || !changeScheduleDTO.getTag3().isEmpty()) {
                            throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
                        }
                    }
                });

        // 새로운 정보로 스케줄 수정
        ScheduleEntity updateSchedule = scheduleEntity.toBuilder()
                .scheduleTitle(changeScheduleDTO.getScheduleTitle())
                .scheduleContent(changeScheduleDTO.getScheduleContent())
                .scheduleModifytime(LocalDateTime.now())
                .scheduleStartdate(changeScheduleDTO.getScheduleStartDate())
                .scheduleFinishdate(changeScheduleDTO.getScheduleFinishDate())
                .build();
        scheduleRepository.save(updateSchedule);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("스케줄 수정에 성공했습니다.", successDTO);
    }

    /**
     * 특정 스케줄 삭제
     *
     * @param scheduleNumber // 스케줄 식별자
     * @return 메시지와 성공여부
     */
    @Transactional
    @Override
    public ResultDTO<SuccessDTO> deleteSchedule(Long scheduleNumber) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 스케줄 식별자로 특정 스케줄 정보 가져오기
        ScheduleEntity scheduleEntity = scheduleRepository.findByScheduleNumber(scheduleNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));

        WorkspaceEntity workspace = scheduleEntity.getWorkspace();

        // 해당 워크스페이스 멤버인지 확인
        WorkspaceMemberEntity workspaceMemberEntity = workspaceMemberRepository.findByWorkspaceAndMember(workspace, member)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 담당자 혹은 권한이 오너인지 확인
        MemberEntity scheduleMemnber = scheduleEntity.getMember();
        boolean isOwner = "owner".equals(workspaceMemberEntity.getWsRole());

        if (scheduleMemnber == null) {
            // 담당자가 없으면 오너 권한만 체크
            if (!isOwner) {
                throw new CustomException(ErrorCode.INVALID_SCHEDULE_MEMBER);
            }
        } else {
            // 담당자가 있을 경우, 담당자이거나 오너여야 함
            if (!scheduleMemnber.equals(member) && !isOwner) {
                throw new CustomException(ErrorCode.INVALID_SCHEDULE_MEMBER);
            }
        }

        // 해당 스케줄의 태그 가져오고 삭제
        scheduleTagRepository.findBySchedule(scheduleEntity)
                .ifPresent(scheduleTagRepository::delete);

        scheduleRepository.delete(scheduleEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("스케줄 삭제에 성공했습니다.", successDTO);
    }

    /**
     * 대분류 태그 생성
     *
     * @param largeTagDTO
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> createLargeTag(LargeTagDTO largeTagDTO) {

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        WorkspaceEntity workspace = workspaceRepository.findById(largeTagDTO.getWsId())
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

        // 대분류 태그 생성
        LargeTagEntity largeTagEntity = LargeTagEntity.builder()
                .workspace(workspace)
                .tagName(largeTagDTO.getTagName())
                .tagColor(largeTagDTO.getTagColor())
                .build();

        largeTagRepository.save(largeTagEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("대분류 태그가 생성되었습니다.", successDTO);
    }

    /**
     * 중분류 태그 생성
     *
     * @param mediumTagDTO
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> createMediumTag(MediumTagDTO mediumTagDTO) {

        // 대분류 식별자로 대분류 태그 찾기
        LargeTagEntity largeTagEntity = largeTagRepository.findById(mediumTagDTO.getLargeTagNumber())
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 중분류 태그 생성
        MediumTagEntity mediumTagEntity = MediumTagEntity.builder()
                .largeTag(largeTagEntity)
                .tagName(mediumTagDTO.getTagName())
                .build();

        mediumTagRepository.save(mediumTagEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("중분류 태그가 생성되었습니다.", successDTO);

    }

    /**
     * 소분류 태그 생성
     *
     * @param smallTagDTO
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> createSmallTag(SmallTagDTO smallTagDTO) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        WorkspaceEntity workspace = workspaceRepository.findById(smallTagDTO.getWsId())
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

        Optional<WorkspaceMemberEntity> byWorkspaceAndMember = workspaceMemberRepository
                .findByWorkspaceAndMember(workspace, member);
        if (byWorkspaceAndMember.isEmpty()) {
            throw new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
        }

        // 중분류 식별자로 중분류 태그 찾기
        MediumTagEntity mediumTagEntity = mediumTagRepository.findById(smallTagDTO.getMediumTagNumber())
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 중분류 태그 식별자와 소분류 태그명이 같은 경우 중복 체크
        Optional<SmallTagEntity> byMediumTagAndTagName = smallTagRepository.findByMediumTagAndTagName(
                mediumTagEntity,
                smallTagDTO.getTagName());
        if (byMediumTagAndTagName.isPresent()) {
            throw new CustomException(ErrorCode.TAG_DUPLICATE);
        }

        // 소분류 태그 생성
        SmallTagEntity smallTagEntity = SmallTagEntity.toEntity(smallTagDTO, mediumTagEntity);

        smallTagRepository.save(smallTagEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("소분류 태그가 생성되었습니다.", successDTO);
    }

    /**
     * 대분류 태그 조회
     *
     * @return
     */
    @Override
    public ResultDTO<List<LargeTagDTO>> getLargeTags(Long wsId) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        WorkspaceEntity workspace = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

        Optional<WorkspaceMemberEntity> byWorkspaceAndMember = workspaceMemberRepository
                .findByWorkspaceAndMember(workspace, member);
        if (byWorkspaceAndMember.isEmpty()) {
            throw new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
        }

        // 대분류 태그 조회
        List<LargeTagEntity> largeTagEntityList = largeTagRepository.findAllByWorkspace(workspace);
        List<LargeTagDTO> largeTagDTOList = new ArrayList<>();
        for (LargeTagEntity largeTagEntity : largeTagEntityList) {
            largeTagDTOList.add(LargeTagDTO.toDTO(largeTagEntity));
        }

        // 대분류 태그 조회에 성공했습니다.
        return ResultDTO.of("대분류 태그 조회에 성공했습니다.", largeTagDTOList);
    }

    /**
     * 중분류 태그 조회
     *
     * @param largeTagNumber
     * @return
     */
    @Override
    public ResultDTO<List<MediumTagDTO>> getMediumTags(Long wsId, Long largeTagNumber) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        WorkspaceEntity workspace = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

        Optional<WorkspaceMemberEntity> byWorkspaceAndMember = workspaceMemberRepository
                .findByWorkspaceAndMember(workspace, member);
        if (byWorkspaceAndMember.isEmpty()) {
            throw new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
        }

        // 대분류 식별자로 대분류 태그 찾기
        LargeTagEntity largeTagEntity = largeTagRepository.findById(largeTagNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 대분류가 해당 스페이스에 속한 대분류인지 확인
        if (!largeTagEntity.getWorkspace().equals(workspace)) {
            throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
        }

        // 중분류 태그 조회
        List<MediumTagEntity> mediumTagEntityList = mediumTagRepository.findAllByLargeTag(largeTagEntity);
        List<MediumTagDTO> mediumTagDTOList = new ArrayList<>();
        for (MediumTagEntity mediumTagEntity : mediumTagEntityList) {
            mediumTagDTOList.add(MediumTagDTO.toDTO(mediumTagEntity));
        }

        // 중분류 태그 조회에 성공했습니다.
        return ResultDTO.of("중분류 태그 조회에 성공했습니다.", mediumTagDTOList);
    }

    /**
     * 소분류 태그 조회
     *
     * @param wsId
     * @param largeTagNumber
     * @param mediumTagNumber
     * @return
     */
    @Override
    public ResultDTO<List<SmallTagDTO>> getSmallTags(Long wsId, Long largeTagNumber, Long mediumTagNumber) {

        // 토큰으로 사용자 정보 가져오기
        String email = AuthUtil.getLoginUserId();
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
        WorkspaceEntity workspace = workspaceRepository.findById(wsId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

        Optional<WorkspaceMemberEntity> byWorkspaceAndMember = workspaceMemberRepository
                .findByWorkspaceAndMember(workspace, member);
        if (byWorkspaceAndMember.isEmpty()) {
            throw new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
        }

        // 대분류 식별자로 대분류 태그 찾기
        LargeTagEntity largeTagEntity = largeTagRepository.findById(largeTagNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 대분류가 해당 스페이스에 속한 대분류인지 확인
        if (!largeTagEntity.getWorkspace().equals(workspace)) {
            throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
        }

        // 중분류 식별자로 중분류 태그 찾기
        MediumTagEntity mediumTagEntity = mediumTagRepository.findById(mediumTagNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 중분류가 해당 대분류에 속한 중분류인지 확인
        if (!mediumTagEntity.getLargeTag().equals(largeTagEntity)) {
            throw new CustomException(ErrorCode.INVALID_TAG_HIERARCHY);
        }

        // 소분류 태그 조회
        List<SmallTagEntity> smallTagEntityList = smallTagRepository.findAllByMediumTag(mediumTagEntity);
        List<SmallTagDTO> smallTagDTOList = new ArrayList<>();
        for (SmallTagEntity smallTagEntity : smallTagEntityList) {
            smallTagDTOList.add(SmallTagDTO.toDTO(smallTagEntity));
        }

        // 소분류 태그 조회에 성공했습니다.
        return ResultDTO.of("소분류 태그 조회에 성공했습니다.", smallTagDTOList);
    }

    /**
     * 대분류 태그 삭제
     *
     * @param largeTagNumber
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> deleteLargeTag(Long largeTagNumber) {

        // 대분류 태그 조회
        LargeTagEntity largeTagEntity = largeTagRepository.findById(largeTagNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 대분류 태그 삭제
        largeTagRepository.delete(largeTagEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("대분류 태그 삭제에 성공했습니다.", successDTO);
    }

    /**
     * 중분류 태그 삭제
     *
     * @param mediumTagNumber
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> deleteMediumTag(Long mediumTagNumber) {

        // 중분류 태그 조회
        MediumTagEntity mediumTagEntity = mediumTagRepository.findById(mediumTagNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 중분류 태그 삭제
        mediumTagRepository.delete(mediumTagEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("중분류 태그 삭제에 성공했습니다.", successDTO);
    }

    /**
     * 소분류 태그 삭제
     *
     * @param smallTagNumber
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> deleteSmallTag(Long smallTagNumber) {

        // 소분류 태그 조회
        SmallTagEntity smallTagEntity = smallTagRepository.findById(smallTagNumber)
                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

        // 소분류 태그 삭제
        smallTagRepository.delete(smallTagEntity);

        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();

        return ResultDTO.of("소분류 태그 삭제에 성공했습니다.", successDTO);
    }
}