package net.scit.backend.workspace.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;


import net.scit.backend.member.dto.MemberLoginStatusDTO;
import net.scit.backend.workspace.repository.WorkspaceChannelRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.cache.annotation.Cacheable;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.MailComponents;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.workspace.dto.InvateWorkspaceDTO;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.dto.WorkspaceMemberDTO;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.entity.WorkspaceChannelRoleEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceChannelRoleRepository;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import net.scit.backend.workspace.service.WorkspaceService;
import net.scit.backend.workspace.dto.UpdateWorkspaceMemberDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceServiceImpl implements WorkspaceService {

    // Repository 및 Component 주입
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final MemberRepository memberRepository;
    private final WorkspaceChannelRoleRepository workspaceRoleRepository;
    private final WorkspaceChannelRepository workspaceChannelRepository;

    private final RedisTemplate<String, String> redisTemplate;
    private final MailComponents mailComponents;
    private final S3Uploader s3Uploader;

    // 상수 선언
    private static final Long MAIL_EXPIRES_IN = 300000L;
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final String DEFAULT_ROLE = "None";
    private static final String OWNER_ROLE = "owner";
    private static final String USER_ROLE = "user";

    // 이미지 업로드 메소드
    private String uploadImage(MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (fileExtension != null && ALLOWED_IMAGE_EXTENSIONS.contains(fileExtension.toLowerCase())) {
                try {
                    return s3Uploader.upload(file, "workspace-images");
                } catch (Exception e) {
                    log.error("❌ S3 업로드 실패: {}", e.getMessage(), e);
                    throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
                }
            } else {
                throw new CustomException(ErrorCode.UN_SUPPORTED_IMAGE_TYPE);
            }
        }
        return null;
    }

    // Redis에 인증코드 저장 메소드
    private void saveInvitationCodeToRedis(String email, String code) {
        redisTemplate.opsForValue().set("newWorkspace: " + email, code, MAIL_EXPIRES_IN, TimeUnit.MILLISECONDS);
    }

    // 초대 이메일 전송 메소드
    private void sendInvitationEmail(String email, String wsName, String code) {
        String title = "BIBIM 새로운 워크스페이스 " + wsName + " 초대되었습니다!";
        String message = "<h3>5분 안에 인증번호를 입력해주세요</h3><br><h1>" + code + "</h1>";
        mailComponents.sendMail(email, title, message);
    }

    // Redis에서 인증코드 검증 메소드
    private void validateInvitationCode(String email, String code) {
        String savedCode = redisTemplate.opsForValue().get("newWorkspace: " + email);
        if (savedCode == null || !savedCode.equals(code)) {
            throw new CustomException(ErrorCode.INVALID_EMAIL_CODE);
        }
    }

    // WorkspaceEntity 조회 메소드
    private WorkspaceEntity getWorkspaceEntity(Long wsId) {
        return workspaceRepository.findById(wsId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_NOT_FOUND));
    }

    // MemberEntity 조회 메소드
    private MemberEntity getMemberEntity(String email) {
        return memberRepository.findById(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));
    }

    // 소유자 권한 확인 메소드
    private void checkOwnerRole(Long wsId, String email) {
        WorkspaceMemberEntity member = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));
        if (!OWNER_ROLE.equals(member.getWsRole())) {
            throw new CustomException(ErrorCode.MEMBER_HAVE_NOT_ROLE);
        }
    }

    // 워크스페이스 생성 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO, MultipartFile file) {
        String imageUrl = uploadImage(file);

        WorkspaceEntity workspaceEntity = workspaceRepository.saveAndFlush(
                WorkspaceEntity.builder().wsName(workspaceDTO.getWsName()).wsImg(imageUrl).build());

        workspaceRoleRepository.saveAndFlush(
                WorkspaceChannelRoleEntity.builder().workspace(workspaceEntity).build());

        MemberEntity memberEntity = getMemberEntity(AuthUtil.getLoginUserId());

        workspaceMemberRepository.save(
                WorkspaceMemberEntity.builder()
                        .member(memberEntity)
                        .workspace(workspaceEntity)
                        .nickname(memberEntity.getName())
                        .profileImage(memberEntity.getProfileImage())
                        .wsRole(OWNER_ROLE)
                        .build());

        workspaceChannelRepository.save(
                WorkspaceChannelEntity.builder()
                        .workspace(workspaceEntity)
                        .channelName("새 채널")
                        .build());

        return ResultDTO.of("워크스페이스 생성에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 삭제 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceDelete(String wsName) {
        String email = AuthUtil.getLoginUserId();
        Long wsId = workspaceRepository.findWsIdByWsNameAndEmail(wsName, email);
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        Optional.ofNullable(workspaceEntity.getWsImg()).ifPresent(s3Uploader::deleteFile);
        workspaceRepository.deleteById(wsId);

        return ResultDTO.of("워크스페이스 삭제에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 사용자가 속한 모든 워크스페이스 목록 조회 메소드
    @Override
    public List<WorkspaceDTO> workspaceList() {
        String email = AuthUtil.getLoginUserId();
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findAllByMemberEmail(email);

        List<WorkspaceDTO> workspaceDTOs = new ArrayList<>();
        workspaceMembers.forEach(member -> workspaceRepository.findById(member.getWorkspace().getWsId())
                .ifPresent(workspace -> workspaceDTOs.add(WorkspaceDTO.toDTO(workspace))));

        return workspaceDTOs;
    }

    // 워크스페이스 정보 업데이트 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceUpdate(String wsName, String newName, MultipartFile file) {
        String email = AuthUtil.getLoginUserId();
        Long wsId = workspaceRepository.findWsIdByWsNameAndEmail(wsName, email);
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        String imageUrl = uploadImage(file);
        workspaceEntity.setWsName(newName);
        workspaceEntity.setWsImg(imageUrl);
        workspaceRepository.save(workspaceEntity);

        return ResultDTO.of("워크스페이스 업데이트에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 탈퇴 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceWithDrwal(Long wsId) {
        String email = AuthUtil.getLoginUserId();
        workspaceMemberRepository.deleteByWorkspace_wsIdAndMember_Email(wsId, email);

        if (workspaceMemberRepository.findByWorkspace_wsId(wsId).isEmpty()) {
            workspaceRepository.deleteById(wsId);
        }

        return ResultDTO.of("워크스페이스 탈퇴에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 강제 퇴출 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> worksapceForceDrawal(Long wsId, String email) {
        checkOwnerRole(wsId, AuthUtil.getLoginUserId());
        workspaceMemberRepository.deleteByWorkspace_wsIdAndMember_Email(wsId, email);

        return ResultDTO.of("워크스페이스 강퇴에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 권한 생성 메소드
    @Override
    public ResultDTO<SuccessDTO> worksapceRightCreate(Long wsId, String newRole) {
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);
        workspaceRoleRepository.save(
                WorkspaceChannelRoleEntity.builder().workspace(workspaceEntity).chRole(newRole).build());

        return ResultDTO.of("워크스페이스 채널 권한 생성에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 권한 부여 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> worksapceRightGrant(Long wsId, String email, Long chRole) {
        checkOwnerRole(wsId, AuthUtil.getLoginUserId());
        WorkspaceMemberEntity member = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        member.setChRoleNumber(workspaceRoleRepository.findById(chRole)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_HAVE_NOT_ROLE)));
        workspaceMemberRepository.save(member);

        return ResultDTO.of("워크스페이스 채널 권한 부여에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 권한 삭제 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> worksapceRightDelete(Long wsId, Long chRole) {
        checkOwnerRole(wsId, AuthUtil.getLoginUserId());
        workspaceRoleRepository.deleteById(chRole);

        return ResultDTO.of("워크스페이스 채널 권한 삭제에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 초대 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaseInvate(Long wsId, String email) {
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);
        String wsName = workspaceEntity.getWsName();

        // 초대 대상 유저가 존재하는지 확인
        getMemberEntity(email);

        // 이미 해당 워크스페이스에 존재하는지 확인
        if (workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email).isPresent()) {
            return ResultDTO.of("이미 워크스페이스에 존재하는 회원입니다.", SuccessDTO.builder().success(false).build());
        }

        // 초대코드 생성 및 이메일 전송
        String code = String.valueOf(new Random().nextInt(900000) + 100000); // 6자리 랜덤 코드
        sendInvitationEmail(email, wsName, code);

        // Redis에 초대 코드 저장
        saveInvitationCodeToRedis(email, code);

        return ResultDTO.of("메일을 보내는 것을 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 초대 수락 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaseAdd(InvateWorkspaceDTO invateWorkspaceDTO) {
        String email = AuthUtil.getLoginUserId();
        Long wsId = invateWorkspaceDTO.getWsID();

        // 이메일 인증 코드 검증
        validateInvitationCode(email, invateWorkspaceDTO.getCode());

        // 유저와 워크스페이스 엔티티 조회
        MemberEntity memberEntity = getMemberEntity(email);
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // 기본 권한 가져오기
        WorkspaceChannelRoleEntity workspaceRoleEntity = workspaceRoleRepository
                .findByWorkspace_wsIdAndChRole(wsId, DEFAULT_ROLE)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_HAVE_NOT_ROLE));

        // 워크스페이스 멤버로 추가
        workspaceMemberRepository.save(
                WorkspaceMemberEntity.builder()
                        .workspace(workspaceEntity)
                        .member(memberEntity)
                        .wsRole(USER_ROLE)
                        .chRoleNumber(workspaceRoleEntity)
                        .nickname(memberEntity.getName())
                        .profileImage(memberEntity.getProfileImage())
                        .build());

        return ResultDTO.of("워크스페이스 추가에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    /**
     * 워크스페이스 내 회원 정보 조회
     * 
     * @param wsId 조회할 워크스페이스 ID
     * @return 워크스페이스 내 회원 정보
     */
    @Override
    public ResultDTO<WorkspaceMemberDTO> getWorkspaceMemberInfo(Long wsId) {
        // JWT에서 로그인한 유저 이메일 가져오기
        String email = AuthUtil.getLoginUserId();

        // WorkSpace_Member 테이블에서 이메일과 wsId로 회원 정보 조회
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // Member 테이블에서 기본 회원 정보(name) 조회
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // DTO 변환
        WorkspaceMemberDTO workspaceMemberDTO = WorkspaceMemberDTO.builder()
                .name(member.getName())  // 기본 회원 이름
                .nickname(workspaceMember.getNickname())  // 워크스페이스 내 닉네임
                .profileImage(workspaceMember.getProfileImage())  // 워크스페이스 내 프로필 이미지
                .build();

        return ResultDTO.of("워크스페이스 회원 정보 조회 성공", workspaceMemberDTO);
    }

    /**
     * 워크스페이스 내 회원 정보 수정
     * @param wsId 워크스페이스 ID
     * @param updateInfo 수정할 정보
     * @param file 프로필 이미지 파일 (선택)
     * @return 수정 결과
     * 
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> updateWorkspaceMemberInfo(Long wsId, UpdateWorkspaceMemberDTO updateInfo, MultipartFile file) {
        // JWT에서 로그인한 유저 이메일 가져오기
        String email = AuthUtil.getLoginUserId();

        // WorkSpace_Member 테이블에서 이메일과 wsId로 회원 정보 조회
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // 닉네임 업데이트
        if (updateInfo.getNickname() != null && !updateInfo.getNickname().isEmpty()) {
            workspaceMember.setNickname(updateInfo.getNickname());
        }

        // 프로필 이미지 업데이트
        if (file != null && !file.isEmpty()) {
            try {
                // 기존 이미지가 있다면 삭제
                if (workspaceMember.getProfileImage() != null && !workspaceMember.getProfileImage().isEmpty()) {
                    s3Uploader.deleteFile(workspaceMember.getProfileImage());
                }
                // 새 이미지 업로드
                String imageUrl = s3Uploader.upload(file, "workspace-profile-images");
                workspaceMember.setProfileImage(imageUrl);
            } catch (IOException e) {
                throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
            }
        }

        // 변경사항 저장
        workspaceMemberRepository.save(workspaceMember);

        return ResultDTO.of("워크스페이스 회원 정보가 성공적으로 수정되었습니다.", 
                SuccessDTO.builder().success(true).build());
    }


    /**
     * 워크스페이스에 소속된 멤버들의 접속현황을 조회합니다.
     * 캐시를 사용하여 5분마다 갱신합니다.
     *
     * @param workspaceId 조회할 워크스페이스의 ID
     * @param userEmail   요청자의 이메일 (소속 여부 검증용)
     * @return 워크스페이스 멤버들의 로그인 상태와 마지막 활동 시간 목록
     */
    @Override
    @Cacheable(value = "workspaceMemberStatus", key = "#p0", unless = "(#result != null) && (#result.isEmpty())")
    public List<MemberLoginStatusDTO> getWorkspaceMembersStatus(Long workspaceId, String userEmail) {
        // 요청한 사용자가 해당 워크스페이스의 멤버인지 확인
        Optional<WorkspaceMemberEntity> membershipOpt =
                workspaceMemberRepository.findByWorkspace_WsIdAndMember_Email(workspaceId, userEmail);
        if (!membershipOpt.isPresent()) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);  // 접근 권한 없음
        }

        // 워크스페이스에 소속된 모든 멤버 조회
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace_WsId(workspaceId);
        List<MemberLoginStatusDTO> statusList = new ArrayList<>();
        workspaceMembers.forEach(wme -> {
            // MemberEntity에서 로그인 상태와 마지막 활동 시간을 가져옴
            statusList.add(new MemberLoginStatusDTO(
                    wme.getMember().getEmail(),
                    wme.getMember().isLoginStatus(),
                    wme.getMember().getLastActiveTime()
            ));
        });
        return statusList;
    }

}
