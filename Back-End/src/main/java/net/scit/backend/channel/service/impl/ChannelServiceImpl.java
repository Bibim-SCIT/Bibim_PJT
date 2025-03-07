package net.scit.backend.channel.service.impl;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.jwt.AuthUtil;
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
    // 레포지토리
    private final MessageReposittory messageReposittory;
    private final WorkspaceChannelRepository workspacechannelRepository;

    // s3업로더
    private final S3Uploader s3Uploader;

    // 상수 선언
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "zip",
            "md");

    // 이미지 업로드 메소드
    private String uploadImage(MultipartFile file, Long channelId) {
        if (file != null && !file.isEmpty()) {
            String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (fileExtension != null && ALLOWED_IMAGE_EXTENSIONS.contains(fileExtension.toLowerCase())) {
                try {
                    return s3Uploader.upload(file, "workspace-channel/" + channelId);
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

    /**
     * 메세지 받고 채널 전체에 흩뿌리기
     * 
     * @param MessageDTO 받은 메세지
     */
    @Override
    public MessageDTO processMessage(MessageDTO messageDTO) {
        if (messageDTO.getMessageOrFile()) {
            log.info("📂 파일 메시지는 processMessage에서 처리하지 않음.");
            return messageDTO;
        }    
        WorkspaceChannelEntity workspaceChannelEntity = workspacechannelRepository
                .findById(messageDTO.getChannelNumber())
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));
        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(messageDTO.getSender())
                .content(messageDTO.getContent())
                .messageOrFile(false)
                .build();
        messageReposittory.save(messageEntity);
        return messageDTO;
    }

    @Override
    public MessageDTO uploadFile(MultipartFile file, String sender, Long channelId) {
        // S3에 파일 업로드 후 URL 반환
        String imageUrl = uploadImage(file, channelId);

        // 채널 찾기
        WorkspaceChannelEntity workspaceChannelEntity = workspacechannelRepository
                .findById(channelId)
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND));

        // 파일 메시지 엔티티 생성 및 저장
        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(sender)
                .content(imageUrl) // 이미지 URL 저장
                .messageOrFile(true) // 파일 여부 설정
                .build();
        messageReposittory.save(messageEntity);

        // DTO 반환
        return MessageDTO.builder()
                .messageOrFile(true)
                .channelNumber(channelId)
                .sender(sender)
                .content(imageUrl) // URL을 클라이언트에게 반환
                .build();
    }

    /**
     * 과거 메세지 불러오기
     * 
     * @param chanchannelNumbernelId
     * @return
     */
    @Override
    public List<MessageDTO> getMessagesByChannel(Long channelNumber) {
        return messageReposittory.findByWorkspaceChannelEntity_ChannelNumber(channelNumber).stream()
                .map(msg -> {
                    MessageDTO dto = new MessageDTO();
                    dto.setChannelNumber(msg.getWorkspaceChannelEntity().getChannelNumber());
                    dto.setSender(msg.getSender());
                    dto.setMessageOrFile(msg.getMessageOrFile());
                    dto.setContent(msg.getContent());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}