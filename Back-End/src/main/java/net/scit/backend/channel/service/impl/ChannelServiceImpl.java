package net.scit.backend.channel.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.channel.DTO.MessageDTO;
import net.scit.backend.channel.entity.MessageEntity;
import net.scit.backend.channel.repository.MessageReposittory;
import net.scit.backend.channel.service.ChannelService;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.repository.WorkspaceChannelRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelServiceImpl implements ChannelService {

    private final MessageReposittory messageReposittory; // 메시지 관련 데이터 처리
    private final WorkspaceChannelRepository workspaceChannelRepository; // 워크스페이스 채널 관련 데이터 처리
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final S3Uploader s3Uploader; // S3 파일 업로드 기능 제공 컴포넌트

    /**
     * 파일을 S3에 업로드하고 업로드된 파일의 URL 반환
     *
     * @param file 업로드할 파일
     * @param channelId 채널 ID (업로드 경로에 활용)
     * @return 업로드된 파일의 URL
     * @throws CustomException 업로드 실패 시 예외 처리
     */
    private String uploadImage(MultipartFile file, Long channelId) {
        // 파일이 비어있지 않으면 처리 진행
        if (file == null || file.isEmpty()) {
            return null; // 파일이 없는 경우 null 반환
        }
        try {
            // S3에 파일 업로드 (경로: workspace-channel/<channelId>)
            return s3Uploader.upload(file, "workspace-channel/" + channelId);
        } catch (Exception e) {
            // 업로드 실패 시 로그 기록 및 예외 처리
            log.error("❌ S3 업로드 실패 (채널 ID: {}, 파일명: {}): {}", channelId, file.getOriginalFilename(), e.getMessage(), e);
            throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE); // 사용자 정의 예외 발생
        }
    }

    /**
     * 주어진 채널 ID로 WorkspaceChannelEntity를 조회하는 유틸리티 메서드
     *
     * @param channelId 채널 ID
     * @return WorkspaceChannelEntity (존재하지 않으면 예외 발생)
     * @throws CustomException 채널이 존재하지 않을 경우 예외 처리
     */
    private WorkspaceChannelEntity getWorkspaceChannelById(Long channelId) {
        // 채널 ID로 엔티티를 조회하고, 없을 경우 CustomException 처리
        return workspaceChannelRepository.findById(channelId)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
    }

    /**
     * 텍스트 메시지를 처리하고 데이터베이스에 저장
     *
     * @param messageDTO 메시지 DTO
     * @return 저장된 메시지 DTO (그대로 반환)
     */
    @Override
    public MessageDTO processMessage(MessageDTO messageDTO) {
        // 파일 메시지는 여기서 처리하지 않으므로 바로 반환

        // 채널 엔티티 가져오기
        WorkspaceChannelEntity workspaceChannelEntity = getWorkspaceChannelById(messageDTO.getChannelNumber());
        
        // 프로필 이미지와 닉네임 가져오기 위해 사용
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(
                                                    workspaceChannelEntity.getWorkspace().getWsId(),
                                                    messageDTO.getSender())
                                                    .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
        
        // 메시지 엔티티 생성 및 저장
        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(messageDTO.getSender())
                .content(messageDTO.getContent())
                .messageOrFile(false) // 텍스트 메시지임을 명시
                .build();
        messageReposittory.save(messageEntity);
        
        messageDTO.setNickname(workspaceMember.getNickname());
        messageDTO.setProfileImage(workspaceMember.getProfileImage()); 

        // 입력된 DTO 데이터를 그대로 반환
        return messageDTO;
    }

    /**
     * 파일 업로드 처리
     *
     * @param file 업로드할 파일
     * @param sender 파일을 업로드한 사용자
     * @param channelId 파일이 업로드될 채널 ID
     * @return 저장된 메시지 정보와 파일 URL을 포함한 DTO
     */
    @Override
    public MessageDTO uploadFile(MultipartFile file, String sender, Long channelId) {
        // 파일을 S3에 업로드하고 URL 받아오기
        String imageUrl = uploadImage(file, channelId);

        // 채널 엔티티 가져오기
        WorkspaceChannelEntity workspaceChannelEntity = getWorkspaceChannelById(channelId);
        // 프로필 이미지와 닉네임 가져오기 위해 사용
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(
                        workspaceChannelEntity.getWorkspace().getWsId(),
                        sender)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));

        // 파일 메시지 엔티티 생성 및 저장
        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(sender)
                .content(imageUrl) // 받은 URL 저장
                .messageOrFile(true) // 파일 메시지임을 명시
                .fileName(file.getOriginalFilename()) // 원본 파일명 저장
                .build();
        messageReposittory.save(messageEntity);

        // 저장된 데이터를 DTO 형태로 반환
        return MessageDTO.builder()
                .messageOrFile(true) // 파일 메시지 여부
                .channelNumber(channelId)
                .nickname(workspaceMember.getNickname())
                .profileImage(workspaceMember.getProfileImage())
                .sender(sender)
                .content(imageUrl) // 클라이언트에게 반환할 URL
                .fileName(file.getOriginalFilename())
                .build();
    }

    /**
     * 특정 채널의 과거 메시지 조회
     *
     * @param channelNumber 채널 번호
     * @return 메시지 DTO 리스트
     */
    @Override
    public List<MessageDTO> getMessagesByChannel(Long channelNumber) {
        // 채널의 메시지 엔티티를 조회하고 MessageDTO로 변환
        return messageReposittory.findByWorkspaceChannelEntity_ChannelNumber(channelNumber).stream()
                .map(this::convertToDTO) // 변환 메서드 사용
                .collect(Collectors.toList());
    }

    /**
     * MessageEntity를 MessageDTO로 변환하는 헬퍼 메서드
     *
     * @param messageEntity 메시지 엔티티
     * @return MessageDTO
     */
    private MessageDTO convertToDTO(MessageEntity messageEntity) {

        // 프로필 사진을 찾기 위한 워크스페이스 아이디 찾기
        WorkspaceChannelEntity workspaceChannelEntity = messageEntity.getWorkspaceChannelEntity();
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(workspaceChannelEntity.getWorkspace().getWsId(),messageEntity.getSender())
                                                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        return MessageDTO.builder()
                .channelNumber(messageEntity.getWorkspaceChannelEntity().getChannelNumber())
                .sender(messageEntity.getSender())
                .nickname(workspaceMember.getNickname())
                .profileImage(workspaceMember.getProfileImage())
                .messageOrFile(messageEntity.getMessageOrFile())
                .content(messageEntity.getContent())
                .sendTime(messageEntity.getSendTime())
                .fileName(messageEntity.getFileName())
                .build();
    }
}