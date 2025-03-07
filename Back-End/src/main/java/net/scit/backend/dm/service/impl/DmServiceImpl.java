package net.scit.backend.dm.service.impl;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.dm.DTO.DmMessageDTO;
import net.scit.backend.dm.entity.DmMessageEntity;
import net.scit.backend.dm.repository.DmRepository;
import net.scit.backend.dm.service.DmService;
import net.scit.backend.component.S3Uploader;

@Service
@RequiredArgsConstructor
@Slf4j
public class DmServiceImpl implements DmService
{
    private final DmRepository DmRepository;
    private final S3Uploader s3Uploader;

    @Override
    public DmMessageDTO processMessage(DmMessageDTO messageDTO) {
        DmMessageEntity messageEntity = DmMessageEntity.builder()
                .wsId(messageDTO.getWsId())
                .sender(messageDTO.getSender())
                .receiver(messageDTO.getReceiver())
                .dmContent(messageDTO.getDmContent())
                .fileName(messageDTO.getFileName())
                .isFile(messageDTO.isFile())
                .isRead(false)
                .build();

        DmRepository.save(messageEntity);
        return messageDTO;
    }

    @Override
    public DmMessageDTO uploadFile(MultipartFile file, String sender, String receiver, Long wsId) 
    {
        String fileUrl = null;
        try {
            fileUrl = s3Uploader.upload(file, "chat/" + wsId);
        } catch (IOException e) {
            e.printStackTrace();
        }
        DmMessageEntity messageEntity = DmMessageEntity.builder()
                .wsId(wsId)
                .sender(sender)
                .receiver(receiver)
                .dmContent(fileUrl)
                .fileName(file.getOriginalFilename())
                .isFile(true)
                .isRead(false)
                .build();

        DmRepository.save(messageEntity);
        return DmMessageDTO.builder()
                .wsId(wsId)
                .sender(sender)
                .receiver(receiver)
                .dmContent(fileUrl)
                .fileName(file.getOriginalFilename())
                .isFile(true)
                .isRead(false)
                .build();
    }

    @Override
    public List<DmMessageDTO> getMessages(Long wsId, String sender, String receiver) {
        List<DmMessageEntity> messages = DmRepository.findByWsIdAndSenderAndReceiver(wsId, sender, receiver);
        messages.addAll(DmRepository.findByWsIdAndSenderAndReceiver(wsId, sender, receiver));
        return messages.stream().map(msg -> new DmMessageDTO(
                msg.getId(), msg.getWsId(), msg.getSender(), msg.getReceiver(), msg.getDmContent(),
                msg.getFileName(), msg.isFile(), msg.isRead())).collect(Collectors.toList());
    }

    @Override
    public void markMessagesAsRead(Long wsId, String sender, String receiver) {
        List<DmMessageEntity> messages = DmRepository.findByWsIdAndSenderAndReceiver(wsId, receiver, sender);
        messages.forEach(msg -> msg.setRead(true));
        DmRepository.saveAll(messages);
    }
}
