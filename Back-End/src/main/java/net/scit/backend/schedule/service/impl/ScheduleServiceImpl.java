package net.scit.backend.schedule.service.impl;

import lombok.RequiredArgsConstructor;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.schedule.dto.LargeTagDTO;
import net.scit.backend.schedule.dto.MediumTagDTO;
import net.scit.backend.schedule.dto.ScheduleDTO;
import net.scit.backend.schedule.dto.SmallTagDTO;
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

import java.util.ArrayList;
import java.util.List;
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
        public ResultDTO<SuccessDTO> createSchedule(ScheduleDTO scheduleDTO) {

                // 토큰으로 사용자 정보 가져오기
                String email = AuthUtil.getLoginUserId();
                MemberEntity member = memberRepository.findByEmail(email)
                                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

                // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
                WorkspaceEntity workspace = workspaceRepository.findById(scheduleDTO.getWsId())
                                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

                Optional<WorkspaceMemberEntity> byWorkspaceAndMember = workspaceMemberRepository
                                .findByWorkspaceAndMember(workspace, member);
                if (byWorkspaceAndMember.isEmpty()) {
                        throw new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
                }

                // 스케쥴 등록
                ScheduleEntity scheduleEntity = ScheduleEntity.toEntity(scheduleDTO, workspace,
                                ScheduleStatus.UNASSIGNED);
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

        @Override
        public ResultDTO<List<ScheduleDTO>> getSchedules(Long wsId) {

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

                List<ScheduleEntity> scheduleEntityList = scheduleRepository.findAllByWorkspace(workspace);
                List<ScheduleDTO> scheduleDTOList = new ArrayList<>();
                for (ScheduleEntity scheduleEntity : scheduleEntityList) {
                        // 해당 스케줄의 담당자 찾기
                        String nickname = null;
                        MemberEntity memberEntity = scheduleEntity.getMember();
                        Optional<WorkspaceMemberEntity> byWorkspaceAndMember1 = workspaceMemberRepository
                                        .findByWorkspaceAndMember(workspace, memberEntity);
                        if (byWorkspaceAndMember1.isPresent()) {
                                nickname = byWorkspaceAndMember1.get().getNickname();
                        }

                        // 해당 스케줄의 태그 가져오기
                        Optional<ScheduleTagEntity> bySchedule = scheduleTagRepository.findBySchedule(scheduleEntity);
                        if (bySchedule.isEmpty()) {
                                scheduleDTOList.add(ScheduleDTO.toDTO(scheduleEntity, nickname, null));
                        } else {
                                ScheduleTagEntity scheduleTagEntity = bySchedule.get();
                                scheduleDTOList.add(ScheduleDTO.toDTO(scheduleEntity, nickname, scheduleTagEntity));
                        }
                }

                return ResultDTO.of("팀 스케줄 리스트를 불러 왔습니다.", scheduleDTOList);
        }

        @Override
        public ResultDTO<ScheduleDTO> getSchedule(Long scheduleNumber) {

                String email = AuthUtil.getLoginUserId();
                MemberEntity member = memberRepository.findByEmail(email)
                                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

                ScheduleEntity scheduleEntity = scheduleRepository.findByScheduleNumber(scheduleNumber)
                                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));

                WorkspaceEntity workspace = scheduleEntity.getWorkspace();

                Optional<WorkspaceMemberEntity> byWorkspaceAndMember = workspaceMemberRepository
                                .findByWorkspaceAndMember(workspace, member);
                if (byWorkspaceAndMember.isEmpty()) {
                        throw new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND);
                }

                ScheduleDTO scheduleDTO = null;

                // 담당자 찾아오기
                String nickname = null;
                MemberEntity memberEntity = scheduleEntity.getMember();
                Optional<WorkspaceMemberEntity> byWorkspaceAndMember1 = workspaceMemberRepository
                                .findByWorkspaceAndMember(workspace, memberEntity);
                if (byWorkspaceAndMember1.isPresent()) {
                        nickname = byWorkspaceAndMember.get().getNickname();
                }

                // 해당 스케줄의 태그 가져오기
                Optional<ScheduleTagEntity> bySchedule = scheduleTagRepository.findBySchedule(scheduleEntity);
                if (bySchedule.isEmpty()) {
                        scheduleDTO = ScheduleDTO.toDTO(scheduleEntity, nickname, null);
                } else {
                        ScheduleTagEntity scheduleTagEntity = bySchedule.get();
                        scheduleDTO = ScheduleDTO.toDTO(scheduleEntity, nickname, scheduleTagEntity);
                }

                return ResultDTO.of("스케줄 상세 조회에 성공했습니다.", scheduleDTO);
        }

        @Override
        public ResultDTO<SuccessDTO> assignSchedule(Long scheduleNumber) {

                String email = AuthUtil.getLoginUserId();
                MemberEntity member = memberRepository.findByEmail(email)
                                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

                ScheduleEntity scheduleEntity = scheduleRepository.findByScheduleNumber(scheduleNumber)
                                .orElseThrow(() -> new CustomException(ErrorCode.SCHEDULE_NOT_FOUND));

                scheduleEntity.setMember(member);
                scheduleRepository.save(scheduleEntity);

                SuccessDTO successDTO = SuccessDTO.builder()
                                .success(true)
                                .build();

                return ResultDTO.of("해당 스케줄 담당에 성공했습니다.", successDTO);
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

                // 중분류 식별자로 중분류 태그 찾기
                MediumTagEntity mediumTagEntity = mediumTagRepository.findById(smallTagDTO.getMediumTagNumber())
                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

                // 소분류 태그 생성
                SmallTagEntity smallTagEntity = SmallTagEntity.builder()
                                .mediumTag(mediumTagEntity)
                                .tagName(smallTagDTO.getTagName())
                                .build();

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

                // 워크스페이스 아이디로 사용자가 속한 워크스페이스인지 확인하기
                WorkspaceEntity workspace = workspaceRepository.findById(wsId)
                                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));

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
        public ResultDTO<List<MediumTagDTO>> getMediumTags(Long largeTagNumber) {

                // 대분류 식별자로 대분류 태그 찾기
                LargeTagEntity largeTagEntity = largeTagRepository.findById(largeTagNumber)
                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

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
         * @param mediumTagNumber
         * @return
         */
        @Override
        public ResultDTO<List<SmallTagDTO>> getSmallTags(Long mediumTagNumber) {

                // 중분류 식별자로 중분류 태그 찾기
                MediumTagEntity mediumTagEntity = mediumTagRepository.findById(mediumTagNumber)
                                .orElseThrow(() -> new CustomException(ErrorCode.TAG_NOT_FOUND));

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