package net.scit.backend.chennel.service.impl;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;
import net.scit.backend.chennel.DTO.MessageDTO;
import net.scit.backend.chennel.entity.MessageEntity;
import net.scit.backend.chennel.repository.MessageReposittory;
import net.scit.backend.chennel.service.ChennelService;
import net.scit.backend.component.S3Uploader;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;
import net.scit.backend.workspace.repository.WorkspaceChennelRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChennelServiceImpl implements ChennelService {
    // 레포지토리
    private final MessageReposittory messageReposittory;
    private final WorkspaceChennelRepository workspaceChennelRepository;

    // s3업로더
    private final S3Uploader s3Uploader;

    // 상수 선언
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif","zip","md");

    // 이미지 업로드 메소드
    private String uploadImage(MultipartFile file, Long chennelId) {
        if (file != null && !file.isEmpty()) {
            String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (fileExtension != null && ALLOWED_IMAGE_EXTENSIONS.contains(fileExtension.toLowerCase())) {
                try {
                    return s3Uploader.upload(file, "workspace-channel/"+chennelId);
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
     * 1. 파일인지 구분
     * 2. 파일이 아니면, 메세지를 디비에 저장
     * 3. 파일이면 s3에 올린 다음 디비에 저장
     */

    /**
     * 메세지 받고 채널 전체에 흩뿌리기
     * 
     * @param MessageDTO 받은 메세지
     */
    @Override
    public MessageDTO processMessage(MessageDTO messageDTO) 
    {
        String email = AuthUtil.getLoginUserId();
        WorkspaceChannelEntity workspaceChannelEntity = workspaceChennelRepository
                .findById(messageDTO.getChannelNumber()).get();
        MessageEntity messageEntity = MessageEntity.builder()
                .workspaceChannelEntity(workspaceChannelEntity)
                .sender(email)
                .content(messageDTO.getContent())
                .massegeOrFile(false)
                .build();
        messageReposittory.save(messageEntity);
        return messageDTO;
    }

    /**
     * 파일을 업로드하고 해당 URL을 채팅 메시지로 저장하는 메서드
     */
    @Override
    public MessageDTO uploadFile(MultipartFile file, String sender, Long chennelId) throws IOException 
    {
        
        String imageUrl = uploadImage(file,chennelId);// S3에 파일 업로드 후 URL 반환
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setMassegeOrFile(true);
        messageDTO.setSender(sender);
        messageDTO.setContent(imageUrl);
        messageDTO.setChannelNumber(chennelId);
        return processMessage(messageDTO); // 메시지로 저장
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
                    dto.setMassegeOrFile(msg.getMassegeOrFile());
                    dto.setContent(msg.getContent());
                    return dto;
                })
                .collect(Collectors.toList());
    }

}
