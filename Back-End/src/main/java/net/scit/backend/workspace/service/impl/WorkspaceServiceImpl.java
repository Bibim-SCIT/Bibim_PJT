package net.scit.backend.workspace.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import net.scit.backend.member.dto.MemberLoginStatusDTO;
import net.scit.backend.workspace.event.WorkspaceEvent;
import net.scit.backend.workspace.repository.WorkspaceChannelRepository;
import org.springframework.context.ApplicationEventPublisher;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

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
import net.scit.backend.workspace.dto.UpdateWorkspaceMemberDTO;
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
    private final ApplicationEventPublisher eventPublisher;

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
    private void saveInvitationCodeToRedis(String email, String code, Long wsId) {
        // 워크스페이스 ID를 포함한 키 생성 (각 워크스페이스별로 초대 코드 저장)
        String inviteKey = "newWorkspace:" + email + ":" + wsId;
        redisTemplate.opsForValue().set(inviteKey, code, MAIL_EXPIRES_IN, TimeUnit.MILLISECONDS);
    }

    // 초대 이메일 전송 메소드
    private void sendInvitationEmail(String email, String wsName, String code) {
        String title = "BIBIM 새로운 워크스페이스 " + wsName + " 초대되었습니다!";
        String message = "<h3>5분 안에 인증번호를 입력해주세요</h3><br><h1>" + code + "</h1>";
        mailComponents.sendMail(email, title, message);
    }

    /**
     * Redis에서 초대 코드 검증 메소드
     * 한번에 여러 초대를 받아도 정상적으로 처리 할 수 있도록 구현
     * 
     * 1. Redis에서 'newWorkspace: *' 패턴으로 모든 초대 코드 검색
     * 2. 저장된 초대 코드와 사용자가 입력한 코드가 일치하는지 확인
     * 3. 일치하는 경우, 해당 이메일에 연결된 워크스페이스 ID 조회
     * 4. Redis에서 사용된 초대 코드와 워크스페이스 ID 정보를 삭제 (한 번만 사용 가능하도록)
     * 5. 워크스페이스 ID 반환
     * 6. 초대 코드가 일치하지 않으면 예외 발생
     *
     * @param code 사용자가 입력한 초대 코드
     * @return 가입할 워크스페이스 ID
     * @throws CustomException 초대 코드가 유효하지 않을 경우 예외 발생
     */
    private Long validateInvitationCode(String code, String email) {
        Set<String> keys = redisTemplate.keys("newWorkspace:*"); // 모든 초대 코드 조회
        if (keys != null) {
            for (String key : keys) {
                String storedCode = redisTemplate.opsForValue().get(key);
                if (storedCode != null && storedCode.equals(code)) {
                    // key에서 이메일과 워크스페이스 ID 추출
                    String[] parts = key.split(":");
                    String keyEmail = parts[1]; // email
                    if (!keyEmail.equals(email)) {
                        throw new CustomException(ErrorCode.EMAIL_NOT_EQUAL);
                    }
                    Long wsId = Long.parseLong(parts[2]); // 워크스페이스 ID

                    // 사용된 초대 코드 삭제 (보안 및 중복 방지)
                    redisTemplate.delete(key);

                    return wsId; // 검증된 워크스페이스 ID 반환
                }
            }
        }
        throw new CustomException(ErrorCode.INVALID_EMAIL_CODE); // 검증 실패 시 예외 발생
    }

    // WorkspaceEntity 조회 메소드
    private WorkspaceEntity getWorkspaceEntity(Long wsId) {
        if (wsId == null) {
            throw new CustomException(ErrorCode.WORKSPACE_NOT_FOUND);
        }
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

        // ✅ (알림 기능) 생성 주체가 될 첫 번째 멤버의 닉네임을 가져오기
        String actorEmail = AuthUtil.getLoginUserId();
        String actorNickname = memberEntity.getName();

        // ✅ (알림 기능) 동일 워크스페이스의 모든 멤버를 조회 (알림 대상)
        List<WorkspaceMemberEntity> workspaceMembers = new ArrayList<>();

        // ✅ (수정) 워크스페이스 멤버 저장 후, 리스트에 추가
        WorkspaceMemberEntity savedMember = workspaceMemberRepository.save(
                WorkspaceMemberEntity.builder()
                        .member(memberEntity)
                        .workspace(workspaceEntity)
                        .nickname(memberEntity.getName())
                        .profileImage(memberEntity.getProfileImage())
                        .wsRole(OWNER_ROLE)
                        .build());
        workspaceMembers.add(savedMember);

        workspaceChannelRepository.save(
                WorkspaceChannelEntity.builder()
                        .workspace(workspaceEntity)
                        .channelName("새 채널")
                        .build());

        // ✅ (SSE 기반 알림 전송) 워크스페이스 이벤트 발행 (모든 멤버에게 알림 전송)
        for (WorkspaceMemberEntity wm : workspaceMembers) {
            eventPublisher.publishEvent(
                    new WorkspaceEvent(workspaceEntity, actorEmail, "create", actorNickname, wm.getNickname())
            );
        }

        return ResultDTO.of("워크스페이스 생성에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }



    // 워크스페이스 삭제 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceDelete(String wsName) {
        String email = AuthUtil.getLoginUserId();
        Long wsId = workspaceRepository.findWsIdByWsNameAndEmail(wsName, email);
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // ✅ (알림 기능) 삭제를 수행하는 사용자의 닉네임 가져오기 (actor)
        WorkspaceMemberEntity actorMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));
        String actorNickname = actorMember.getNickname(); // 삭제한 사람의 워크스페이스 닉네임

        // ✅ (알림 기능) 동일 워크스페이스에 속한 모든 멤버 가져오기 (알림 대상)
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace_wsId(wsId);


        Optional.ofNullable(workspaceEntity.getWsImg()).ifPresent(s3Uploader::deleteFile);
        workspaceRepository.deleteById(wsId);

        // ✅ (알림 기능) 워크스페이스 이벤트 발행 (삭제한 사람의 닉네임 포함)
        for (WorkspaceMemberEntity member : workspaceMembers) {
            String targetNickname = member.getNickname(); // 알림을 받는 사람의 닉네임
            eventPublisher.publishEvent(new WorkspaceEvent(workspaceEntity, email, "delete", actorNickname, targetNickname));
        }



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

        // ID가 null인 경우 예외 처리
        if (wsId == null) {
            return ResultDTO.of("해당 워크스페이스를 찾을 수 없습니다.", SuccessDTO.builder().success(false).build());
        }

        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // ✅ (알림 기능) 업데이트를 수행하는 사용자의 닉네임 가져오기 (actor)
        WorkspaceMemberEntity actorMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));
        String actorNickname = actorMember.getNickname(); // 업데이트한 사람의 닉네임

        // ✅ (알림 기능) 동일 워크스페이스에 속한 모든 멤버 가져오기 (알림 대상)
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace_wsId(wsId);

        // 기존 이미지 URL 유지 (NULL 값 방지)
        String imageUrl = workspaceEntity.getWsImg();
        if (file != null && !file.isEmpty()) {
            imageUrl = uploadImage(file); // 새 이미지 업로드
        }

        // String imageUrl = uploadImage(file);
        workspaceEntity.setWsName(newName);
        workspaceEntity.setWsImg(imageUrl);
        workspaceRepository.save(workspaceEntity);

        // ✅ (알림 기능) 워크스페이스 이벤트 발행 (업데이트한 사람의 닉네임 포함)
        for (WorkspaceMemberEntity member : workspaceMembers) {
            String targetNickname = member.getNickname(); // 알림을 받는 사람의 닉네임
            eventPublisher.publishEvent(new WorkspaceEvent(workspaceEntity, email, "update", actorNickname, targetNickname));
        }

        return ResultDTO.of("워크스페이스 업데이트에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 탈퇴 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceWithDrwal(Long wsId) {
        String email = AuthUtil.getLoginUserId();

        // ✅ (알림 기능) 탈퇴할 사용자 정보 조회 (닉네임 포함)
        WorkspaceMemberEntity member = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // ✅ (알림 기능) 탈퇴한 회원의 닉네임 조회
        String memberNickname = member.getNickname();

        // ✅ (알림 기능) 워크스페이스 엔티티 조회 (삭제 전에 가져와야 함)
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // 멤버 삭제 (탈퇴)
        workspaceMemberRepository.deleteByWorkspace_wsIdAndMember_Email(wsId, email);

        boolean isWorkspaceDeleted = false;
        if (workspaceMemberRepository.findByWorkspace_wsId(wsId).isEmpty()) {
            workspaceRepository.deleteById(wsId);
            isWorkspaceDeleted = true;
        }

        // ✅ (알림 기능) 워크스페이스 탈퇴 이벤트 발행
        eventPublisher.publishEvent(new WorkspaceEvent(workspaceEntity, email, "withdraw", memberNickname, memberNickname));


        return ResultDTO.of("워크스페이스 탈퇴에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }


    // 워크스페이스 강제 퇴출 메소드
    @Override
    @Transactional
    @CacheEvict(value = "workspaceMemberList", key = "#wsId")
    public ResultDTO<SuccessDTO> workspaceForceDrawal(Long wsId, String email) {

        checkOwnerRole(wsId, AuthUtil.getLoginUserId());
        workspaceMemberRepository.deleteByWorkspace_wsIdAndMember_Email(wsId, email);

        return ResultDTO.of("워크스페이스 강퇴에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 권한 생성 메소드(특정 채널 접속 권한)
    @Override
    public ResultDTO<SuccessDTO> workspaceRightCreate(Long wsId, String newRole) {
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        workspaceRoleRepository.save(
                WorkspaceChannelRoleEntity.builder().workspace(workspaceEntity).chRole(newRole).build());

        return ResultDTO.of("워크스페이스 채널 권한 생성에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 워크스페이스 권한 부여 메소드(특정 채널 접속 권한)
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceRightGrant(Long wsId, String email, Long chRole) {
        //  소유자 권한 확인 (권한 부여 권한이 있는지)
        checkOwnerRole(wsId, AuthUtil.getLoginUserId());

        //  대상 멤버 조회 (권한을 부여받는 사람)
        WorkspaceMemberEntity member = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        //  대상 멤버의 역할 정보 업데이트
        member.setChRoleNumber(workspaceRoleRepository.findById(chRole)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_HAVE_NOT_ROLE)));
        workspaceMemberRepository.save(member);

        // 워크스페이스 엔티티 조회
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // ✅ (알림 기능) 권한을 부여한 사람(행동 주체)의 닉네임 조회
        String actorEmail = AuthUtil.getLoginUserId();
        WorkspaceMemberEntity actorMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, actorEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));
        String actorNickname = actorMember.getNickname();  // 🔹 **권한 부여자의 닉네임 조회 추가**

        //  ✅ (알림 기능) 권한을 부여받는 사람(대상)의 닉네임 조회
        String targetNickname = member.getNickname();  // 🔹 **권한을 부여받는 사람의 닉네임 추가**

        //  ✅ (알림 기능) 동일 워크스페이스에 속한 모든 멤버 가져오기 (알림 대상)
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace_wsId(wsId);

        //  ✅ (알림 기능) 워크스페이스 이벤트 발행 (모든 멤버에게 알림 전송)
        for (WorkspaceMemberEntity wm : workspaceMembers) {
            eventPublisher.publishEvent(
                    new WorkspaceEvent(workspaceEntity, actorEmail, "grant", actorNickname, targetNickname) // 🔹 **닉네임 정보 추가**
            );
        }

        return ResultDTO.of("워크스페이스 채널 권한 부여에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }


    // 워크스페이스 권한 삭제 메소드(특정 채널 접속 권한)
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceRightDelete(Long wsId, Long chRole) {
        checkOwnerRole(wsId, AuthUtil.getLoginUserId());
        workspaceRoleRepository.deleteById(chRole);

        return ResultDTO.of("워크스페이스 채널 권한 삭제에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 초대 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceInvate(Long wsId, String email) {
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);
        String wsName = workspaceEntity.getWsName();

        // 초대 대상 유저가 존재하는지 확인
        getMemberEntity(email);

        // ✅ (알림 기능) 초대하는 사람(행동 주체)의 닉네임 조회
        String actorEmail = AuthUtil.getLoginUserId();
        WorkspaceMemberEntity actorMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, actorEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));
        String actorNickname = actorMember.getNickname(); // 초대하는 사람 닉네임

        // ✅ (알림 기능) 초대받는 사람(대상)의 닉네임 조회
        MemberEntity targetMember = getMemberEntity(email);
        String targetNickname = targetMember.getName(); // 초대받는 사람 닉네임

        // 이미 해당 워크스페이스에 존재하는지 확인
        if (workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email).isPresent()) {
            return ResultDTO.of("이미 워크스페이스에 존재하는 회원입니다.", SuccessDTO.builder().success(false).build());
        }

        // 초대코드 생성 및 이메일 전송
        String code = String.valueOf(new Random().nextInt(900000) + 100000); // 6자리 랜덤 코드
        sendInvitationEmail(email, wsName, code);

        // Redis에 초대 코드 저장
        saveInvitationCodeToRedis(email, code, wsId);

        // ✅ (알림 기능) 워크스페이스 이벤트 발행 (초대한 사람과 초대받는 사람에게만 알림 전송)
        eventPublisher.publishEvent(new WorkspaceEvent(workspaceEntity, actorEmail, "invite", actorNickname, targetNickname));
        eventPublisher.publishEvent(new WorkspaceEvent(workspaceEntity, email, "invite", actorNickname, targetNickname));


        return ResultDTO.of("메일을 보내는 것을 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

    // 초대 수락 메소드
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceAdd(String code) {
        String email = AuthUtil.getLoginUserId();

        // 이메일 인증 코드 검증
        Long wsId = validateInvitationCode(code, email);

        // 유저와 워크스페이스 엔티티 조회
        MemberEntity memberEntity = getMemberEntity(email);
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // ✅ (변경 O) 워크스페이스 멤버로 추가 (추가된 객체를 직접 활용)
        WorkspaceMemberEntity newMember = workspaceMemberRepository.save(
                WorkspaceMemberEntity.builder()
                        .workspace(workspaceEntity)
                        .member(memberEntity)
                        .wsRole(USER_ROLE)
                        .chRoleNumber(null)
                        .nickname(memberEntity.getName())
                        .profileImage(memberEntity.getProfileImage())
                        .build());

        // ✅ (최소한의 수정) 이벤트 발행 시, 객체에서 직접 닉네임 가져오기
        for (WorkspaceMemberEntity wm : workspaceMemberRepository.findByWorkspace_wsId(wsId)) {
            eventPublisher.publishEvent(
                    new WorkspaceEvent(workspaceEntity, email, "join", newMember.getNickname(), wm.getNickname())
            );
        }

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
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));

        // Member 테이블에서 기본 회원 정보(name) 조회
        MemberEntity member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // DTO 변환
        WorkspaceMemberDTO workspaceMemberDTO = WorkspaceMemberDTO.builder()
                .name(member.getName()) // 기본 회원 이름
                .nickname(workspaceMember.getNickname()) // 워크스페이스 내 닉네임
                .profileImage(workspaceMember.getProfileImage()) // 워크스페이스 내 프로필 이미지
                .build();

        return ResultDTO.of("워크스페이스 회원 정보 조회 성공", workspaceMemberDTO);
    }

    /**
     * 워크스페이스 내 회원 정보 수정
     * 
     * @param wsId       워크스페이스 ID
     * @param updateInfo 수정할 정보
     * @param file       프로필 이미지 파일 (선택)
     * @return 수정 결과
     * 
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> updateWorkspaceMemberInfo(Long wsId, UpdateWorkspaceMemberDTO updateInfo,
            MultipartFile file) {
        // JWT에서 로그인한 유저 이메일 가져오기
        String email = AuthUtil.getLoginUserId();

        // WorkSpace_Member 테이블에서 이메일과 wsId로 회원 정보 조회
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, email)
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

        // ✅ (알림 기능) 현재 사용자의 닉네임 가져오기
        String myNickname = workspaceMember.getNickname();

        // ✅ (알림 기능) 워크스페이스 엔티티 조회
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // ✅ (알림 기능) 알림은 나에게만 전송
        eventPublisher.publishEvent(
                new WorkspaceEvent(workspaceEntity, email, "member_update", myNickname, myNickname)
        );

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
        Optional<WorkspaceMemberEntity> membershipOpt = workspaceMemberRepository
                .findByWorkspace_WsIdAndMember_Email(workspaceId, userEmail);
        if (!membershipOpt.isPresent()) {
            throw new CustomException(ErrorCode.ACCESS_DENIED); // 접근 권한 없음
        }

        // 워크스페이스에 소속된 모든 멤버 조회
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace_WsId(workspaceId);
        List<MemberLoginStatusDTO> statusList = new ArrayList<>();
        workspaceMembers.forEach(wme -> {
            // MemberEntity에서 로그인 상태와 마지막 활동 시간을 가져옴
            statusList.add(new MemberLoginStatusDTO(
                    wme.getMember().getEmail(),
                    wme.getMember().isLoginStatus(),
                    wme.getMember().getLastActiveTime()));
        });
        return statusList;
    }
  
  
    @Override
    @Cacheable(value = "workspaceMemberList", key = "#workspaceId", unless = "#result == null || #result.isEmpty()")
    public List<WorkspaceMemberDTO> getWorkspaceMembers(Long workspaceId, String userEmail) {
        // 요청한 사용자가 해당 워크스페이스의 멤버인지 확인
        Optional<WorkspaceMemberEntity> membershipOpt = workspaceMemberRepository
                .findByWorkspace_WsIdAndMember_Email(workspaceId, userEmail);
        if (!membershipOpt.isPresent()) {
            throw new CustomException(ErrorCode.ACCESS_DENIED); // 접근 권한 없음
        }

        // 워크스페이스에 소속된 모든 멤버 조회
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace_WsId(workspaceId);
        List<WorkspaceMemberDTO> memberList = new ArrayList<>();

        workspaceMembers.forEach(wme -> {
            WorkspaceMemberDTO dto = WorkspaceMemberDTO.builder()
                    .email(wme.getMember().getEmail())
                    .name(wme.getMember().getName())
                    .nickname(wme.getNickname())
                    .wsRole(wme.getWsRole())
                    .profileImage(wme.getProfileImage())
                    .lastActiveTime(wme.getMember().getLastActiveTime())
                    .build();

            memberList.add(dto);
        });

        return memberList;
    }

    /**
     * 해당 유저의 워크스페이스의 역할을 변경하는 메소드(owner <-> user)
     *
     * @param wsId 워크스페이스 ID
     * @param email 이메일
     */
    @Override
    public ResultDTO<SuccessDTO> workspaceRoleUpdate(Long wsId, String email, String newRole) {
        checkOwnerRole(wsId, AuthUtil.getLoginUserId());

        WorkspaceMemberEntity member = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(wsId, email)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));
        member.setWsRole(newRole);
        workspaceMemberRepository.save(member);

        // ✅ (알림 기능) 역할을 변경한 사람(행동 주체)의 닉네임 조회
        String actorEmail = AuthUtil.getLoginUserId();
        WorkspaceMemberEntity actorMember = workspaceMemberRepository
                .findByWorkspace_wsIdAndMember_Email(wsId, actorEmail)
                .orElseThrow(() -> new CustomException(ErrorCode.WORKSPACE_MEMBER_NOT_FOUND));
        String actorNickname = actorMember.getNickname(); // 역할 변경을 수행한 사람의 닉네임

        // ✅ (알림 기능) 역할이 변경된 사람(대상)의 닉네임 조회
        String targetNickname = member.getNickname(); // 역할이 변경된 대상의 닉네임

        // ✅ (알림 기능) 동일 워크스페이스 내 모든 멤버 조회 (알림 대상)
        WorkspaceEntity workspaceEntity = getWorkspaceEntity(wsId);

        // ✅ (알림 기능) 워크스페이스 엔티티 조회
        List<WorkspaceMemberEntity> workspaceMembers = workspaceMemberRepository.findByWorkspace_wsId(wsId);

        // ✅ (알림 기능) 워크스페이스 이벤트 발행 (모든 멤버에게 알림 전송)
        for (WorkspaceMemberEntity wm : workspaceMembers) {
            eventPublisher.publishEvent(
                    new WorkspaceEvent(workspaceEntity, actorEmail, "role_update", actorNickname, targetNickname)
            );
        }
        return ResultDTO.of("워크스페이스 역할 변경에 성공했습니다.", SuccessDTO.builder().success(true).build());
    }

}
