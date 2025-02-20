package net.scit.backend.workspace.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.common.ResultDTO;
import net.scit.backend.common.SuccessDTO;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.member.repository.MemberRepository;
import net.scit.backend.workspace.dto.WorkspaceDTO;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.entity.WorkspaceRoleEntity;
import net.scit.backend.workspace.repository.WorkspaceChennelRepository;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import net.scit.backend.workspace.repository.WorkspaceRepository;
import net.scit.backend.workspace.repository.WorkspaceRoleRepository;
import net.scit.backend.workspace.service.WorkspaceService;

import java.util.*;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final MemberRepository memberRepository;
    private final WorkspaceRoleRepository workspaceRoleRepository;
    private final WorkspaceChennelRepository workspaceChennelRepository;

    private final S3Uploader s3Uploader;

    /**
     * 워크스페이스 생성 메소드
     * 
     * @param workspaceDTO 워크스페이스 대한 정보
     * @return 결과 확인 메세지
     */
    @Override
    @Transactional
    public ResultDTO<SuccessDTO> workspaceCreate(WorkspaceDTO workspaceDTO, MultipartFile file) {
        // 프로필 이미지
        String imageUrl = null;
        if (file != null && !file.isEmpty()) { // ✅ file이 null인지 먼저 체크한 후 isEmpty() 확인
            // 파일 이름에서 확장자 추출
            String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            // 지원하는 이미지 파일 확장자 목록
            List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "gif");
            // 확장자가 이미지 파일인지 확인
            if (fileExtension != null && allowedExtensions.contains(fileExtension.toLowerCase())) {
                try { // 이미지 업로드하고 url 가져오기
                    imageUrl = s3Uploader.upload(file, "workspace-images");
                    log.info("✅ 업로드 완료: {}", imageUrl);
                } catch (Exception e) {
                    log.error(e.getMessage(), e);
                    log.error("❌ S3 업로드 실패: {}", e.getMessage());
                    throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
                }
            } else {
                // 이미지 파일이 아닌 경우에 대한 처리
                log.warn("⚠️ 파일이 없으므로 기본 프로필 이미지를 사용합니다.");
                throw new CustomException(ErrorCode.UN_SUPPORTED_IMAGE_TYPE);
            }
        }
        log.info("📝 최종 저장할 이미지 URL: {}", imageUrl);

        // 새로운 워크스페이스 생성
        WorkspaceEntity workspaceEntity;
        workspaceEntity = WorkspaceEntity.builder()
                            .wsName(workspaceDTO.getWsName())
                            .wsImg(imageUrl)
                            .build();
        workspaceEntity = workspaceRepository.saveAndFlush(workspaceEntity);

        // 채널의 기본 역할을 추가함
        WorkspaceRoleEntity workspaceRoleEntity = WorkspaceRoleEntity.builder()
                .workspace(workspaceEntity).build();
        workspaceRoleRepository.saveAndFlush(workspaceRoleEntity);

        // 현재 로그인한 유저 이메일을 가져옴
        String email = AuthUtil.getLoginUserId();

        // 현재 로그인한 유저의 정보를 가져옴
        MemberEntity memberEntity = memberRepository.findById(email).get();

        // 워크스페이스 멤버 엔티티에 데이터를 저장
        WorkspaceMemberEntity workspaceMemberEntity = WorkspaceMemberEntity.builder()
                .member(memberEntity)
                .workspace(workspaceEntity)
                .chRoleNumber(workspaceRoleEntity)
                .nickname(memberEntity.getName())
                .profileImage(memberEntity.getProfileImage())
                .build();
        workspaceMemberRepository.save(workspaceMemberEntity);

        //워크스페이스 채널 생성
        WorkspaceChannelEntity workspaceChannelEntity = WorkspaceChannelEntity.builder()
                .workspace(workspaceEntity)
                .workspaceRole(workspaceRoleEntity)
                .channelName("새 채널")
                .build();
        workspaceChennelRepository.save(workspaceChannelEntity);
        // 성공시 DTO 저장
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("워크스페이스 생성에 성공했습니다.", successDTO);

    }

    /**
     * 워크스페이스 삭제 메소드
     * @param wsName 삭제할 워크스페이스 이름
     */
    @Override
    public ResultDTO<SuccessDTO> workspaceDelete(String wsName) 
    {
        // 현재 로그인 한 이메일을 받음음
        String email = AuthUtil.getLoginUserId();
        // 워크스페이스 id 검색
        Long wsId = workspaceRepository.findWorkspaceIdByWsNameAndEmail(wsName, email);
        WorkspaceEntity w = workspaceRepository.findById(wsId).get();
        // 사진 삭제
        s3Uploader.deleteFile(w.getWsImg());
        // 워크스페이스 삭제
        workspaceRepository.deleteById(wsId);   
        // 성공시 DTO 저장
        SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
        // 결과 반환
        return ResultDTO.of("워크스페이스 삭제에 성공했습니다.", successDTO);
    }

    /**
     * 워크스페이스 반환 메소드
     * @return 해당 멤버의 워크스페이스리스트
     */
    @Override
    public List<WorkspaceDTO>  workspaceList()  
    {
        // 현재 로그인한 아이디 확인
        String email = AuthUtil.getLoginUserId();
        // 해당 유저가 참여중인 모든 워크스페이스 검색
        List<WorkspaceMemberEntity> workspaceMemberEntities = workspaceMemberRepository.findAllByMemberEmail(email);
        // 모든 워크스페이스 리스트
        List<WorkspaceDTO> workspaceDTOs = new ArrayList<>();
        if (workspaceMemberEntities.size() == 0) 
        {
            // 결과 반환
            // 예외 처리
        }

        workspaceMemberEntities.forEach((e)->
        {
            workspaceDTOs.add(WorkspaceDTO.toDTO(workspaceRepository.findById(e.getWorkspace().getWsId()).get()));
        });

        // 결과 반환
        return workspaceDTOs;
    }
    /**
     * 파일이 있는 경우
     * @param wsName
     * @param file
     * @return
     */
    @Override
    public ResultDTO<SuccessDTO> workspaceUpdate(String wsName, String newName,MultipartFile file) 
    {
        String email = AuthUtil.getLoginUserId();
        Long wsId = workspaceRepository.findWorkspaceIdByWsNameAndEmail(wsName, email);
        WorkspaceEntity workspaceEntity = workspaceRepository.findById(wsId).get();
        // // 프로필 이미지
        // String imageUrl = null;
        // if (file != null && !file.isEmpty()) { // ✅ file이 null인지 먼저 체크한 후 isEmpty() 확인
        //     // 파일 이름에서 확장자 추출
        //     String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        //     // 지원하는 이미지 파일 확장자 목록
        //     List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "gif");
        //     // 확장자가 이미지 파일인지 확인
        //     if (fileExtension != null && allowedExtensions.contains(fileExtension.toLowerCase())) {
        //         try { // 이미지 업로드하고 url 가져오기
        //             String oldfile_name = workspaceEntity.getWsImg();
        //             s3Uploader.deleteFile(oldfile_name);
        //             imageUrl = s3Uploader.upload(file, "workspace-images");
        //             log.info("✅ 업로드 완료: {}", imageUrl);
        //         } catch (Exception e) {
        //             log.error(e.getMessage(), e);
        //             log.error("❌ S3 업로드 실패: {}", e.getMessage());
        //             throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
        //         }
        //     } else 
        //     {
        //         workspaceEntity.setWsName(newName);
        //         workspaceRepository.save(workspaceEntity);

        //         // 성공시 DTO 저장 
        //         SuccessDTO successDTO = SuccessDTO.builder()
        //         .success(true)
        //         .build();
        //         // 결과 반환
        //         return ResultDTO.of("워크스페이스 이름 변경에 성공했습니다.", successDTO);
        //     }
        // }
        // log.info("📝 최종 저장할 이미지 URL: {}", imageUrl);
        workspaceEntity.setWsName(newName);
        // workspaceEntity.setWsImg(imageUrl);
        // log.info("===={}",workspaceEntity.toString());
        workspaceRepository.save(workspaceEntity);
                // 성공시 DTO 저장 
                SuccessDTO successDTO = SuccessDTO.builder()
                .success(true)
                .build();
                // 결과 반환
        return ResultDTO.of("워크스페이스 이름및 사진 변경에 성공했습니다.", successDTO);
    }
}
