package net.scit.backend.dm.service.impl;

import java.io.IOException;
import java.util.Arrays;
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
public class DmServiceImpl implements DmService {
    private final DmRepository DmRepository;
    private final S3Uploader s3Uploader;

    private String cleanEmail(String email) {
        return email.toLowerCase().split("@")[0];
    }

    // 방 아이디 생성 메소드
    private String generateRoomId(Long wsId, String senderEmail, String receiverEmail) {
        String[] emails = { cleanEmail(senderEmail), cleanEmail(receiverEmail) };
        Arrays.sort(emails);
        return "dm-" + wsId + "-" + emails[0] + "-" + emails[1];
    }

    // ✅ 메시지 전송 메소드
    @Override
    public DmMessageDTO processMessage(DmMessageDTO messageDTO) {
        String roomId = generateRoomId(messageDTO.getWsId(), messageDTO.getSender(), messageDTO.getReceiver());

        DmMessageEntity messageEntity = DmMessageEntity.builder()
                .wsId(messageDTO.getWsId())
                .roomId(roomId)
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

    // ✅ 파일 업로드 메소드
    @Override
    public DmMessageDTO uploadFile(MultipartFile file, String sender, String receiver, Long wsId) {
        String fileUrl = null;
        String roomId = generateRoomId(wsId, sender, receiver);
        try {
            fileUrl = s3Uploader.upload(file, "chat/" + wsId + "/" + roomId);
        } catch (IOException e) {
            e.printStackTrace();
        }
        DmMessageEntity messageEntity = DmMessageEntity.builder()
                .wsId(wsId)
                .roomId(roomId)
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

    // ✅ 메시지 조회 메소드
    @Override
    public List<DmMessageDTO> getMessages(Long wsId,String roomId) {
        List<DmMessageEntity> messages = DmRepository.findByRoomIdOrderBySendTimeAsc(roomId);
        return messages.stream().map(msg -> new DmMessageDTO(
                msg.getId(), msg.getWsId(), msg.getSender(), msg.getReceiver(), msg.getDmContent(),
                msg.getFileName(), msg.isFile(), msg.isRead(), msg.getSendTime(), msg.getRoomId()))
                .collect(Collectors.toList());
    }

    // ✅ 읽음 처리 메소드
    @Override
    public void markMessagesAsRead(Long wsId, String sender, String receiver) {
        String roomId = generateRoomId(wsId, sender, receiver);
        List<DmMessageEntity> messages = DmRepository.findByWsIdAndRoomIdOrderBySendTimeAsc(wsId, roomId);
        messages.forEach(msg -> msg.setRead(true));
        DmRepository.saveAll(messages);
    }
}
