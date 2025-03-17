package net.scit.backend.channel.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
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
public class ChannelServiceImpl implements ChannelService {

    private final MessageReposittory messageReposittory;
    private final WorkspaceChannelRepository workspaceChannelRepository;
    private final S3Uploader s3Uploader;

    /**
     * 파일을 S3에 업로드하고 URL을 반환하는 메서드
     *
     * @param file 업로드할 파일 객체
     * @param channelId 채널 ID (파일 경로에 사용)
     * @return 업로드된 파일의 URL
     */
    private String uploadImage(MultipartFile file, Long channelId) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            return s3Uploader.upload(file, "workspace-channel/" + channelId);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.FAILED_IMAGE_SAVE);
        }
    }

    /**
     * 채널 ID로 워크스페이스 채널 엔티티를 조회
     *
     * @param channelId 조회할 채널 ID
     * @return 존재하는 WorkspaceChannelEntity
     */
    private WorkspaceChannelEntity getWorkspaceChannelById(Long channelId) {
        return workspaceChannelRepository.findById(channelId)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
    }

    /**
     * 텍스트 메시지를 처리하고 저장하는 메서드
     *
     * @param messageDTO 처리할 메시지 DTO
     * @return 저장된 메시지 DTO
     */
    @Override
    public MessageDTO processMessage(MessageDTO messageDTO) {
        if (messageDTO.getMessageOrFile()) {
            return messageDTO;
        }

        WorkspaceChannelEntity workspaceChannelEntity = getWorkspaceChannelById(messageDTO.getChannelNumber());

        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(messageDTO.getSender())
                .content(messageDTO.getContent())
                .messageOrFile(false)
                .build();
        messageReposittory.save(messageEntity);

        return messageDTO;
    }

    /**
     * 파일을 업로드하고 메시지로 저장하는 메서드
     *
     * @param file 업로드할 파일 객체
     * @param sender 업로드한 사용자 이름
     * @param channelId 업로드 대상 채널 ID
     * @return 저장된 파일 메시지 DTO
     */
    @Override
    public MessageDTO uploadFile(MultipartFile file, String sender, Long channelId) {
        String imageUrl = uploadImage(file, channelId);
        WorkspaceChannelEntity workspaceChannelEntity = getWorkspaceChannelById(channelId);

        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(sender)
                .content(imageUrl)
                .messageOrFile(true)
                .fileName(file.getOriginalFilename())
                .build();
        messageReposittory.save(messageEntity);

        return MessageDTO.builder()
                .messageOrFile(true)
                .channelNumber(channelId)
                .sender(sender)
                .content(imageUrl)
                .fileName(file.getOriginalFilename())
                .build();
    }

    /**
     * 특정 채널의 과거 메시지를 조회하는 메서드
     *
     * @param channelNumber 조회할 채널 번호
     * @return 해당 채널의 메시지 DTO 리스트
     */
    @Override
    public List<MessageDTO> getMessagesByChannel(Long channelNumber) {
        return messageReposittory.findByWorkspaceChannelEntity_ChannelNumber(channelNumber).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * MessageEntity를 MessageDTO로 변환하는 헬퍼 메서드
     *
     * @param messageEntity 변환할 메시지 엔티티
     * @return 변환된 메시지 DTO
     */
    private MessageDTO convertToDTO(MessageEntity messageEntity) {
        return MessageDTO.builder()
                .channelNumber(messageEntity.getWorkspaceChannelEntity().getChannelNumber())
                .sender(messageEntity.getSender())
                .messageOrFile(messageEntity.getMessageOrFile())
                .content(messageEntity.getContent())
                .sendTime(messageEntity.getSendTime())
                .fileName(messageEntity.getFileName())
                .build();
    }
}
