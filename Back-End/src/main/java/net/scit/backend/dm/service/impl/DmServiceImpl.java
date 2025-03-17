package net.scit.backend.dm.service.impl;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import net.scit.backend.dm.DTO.DmMessageDTO;
import net.scit.backend.dm.entity.DmMessageEntity;
import net.scit.backend.dm.repository.DmRepository;
import net.scit.backend.dm.service.DmService;
import net.scit.backend.component.S3Uploader;

@Service
@RequiredArgsConstructor
public class DmServiceImpl implements DmService {

    private final DmRepository dmRepository; // DM 데이터베이스 접근 객체
    private final S3Uploader s3Uploader; // S3 파일 업로더 컴포넌트

    /**
     * 이메일에서 사용자명만 추출
     *
     * @param email 이메일 주소
     * @return 추출된 소문자 사용자명
     */
    private String cleanEmail(String email) {
        return email.toLowerCase().split("@")[0];
    }

    /**
     * DM 방 ID를 생성 (두 이메일을 정렬하여 일관성 유지)
     *
     * @param wsId 워크스페이스 ID
     * @param senderEmail 발신자 이메일
     * @param receiverEmail 수신자 이메일
     * @return 생성된 방 ID
     */
    private String generateRoomId(Long wsId, String senderEmail, String receiverEmail) {
        String[] emails = { cleanEmail(senderEmail), cleanEmail(receiverEmail) };
        Arrays.sort(emails);
        return "dm-" + wsId + "-" + emails[0] + "-" + emails[1];
    }

    /**
     * 일반 텍스트 메시지를 처리하고 저장
     *
     * @param messageDTO 저장할 메시지 DTO
     * @return 저장된 메시지 DTO
     */
    @Override
    public DmMessageDTO processMessage(DmMessageDTO messageDTO) {
        String roomId = generateRoomId(messageDTO.getWsId(), messageDTO.getSender(), messageDTO.getReceiver());
        DmMessageEntity messageEntity = mapToEntity(messageDTO, roomId);
        messageEntity.setRead(false); // 기본적으로 읽지 않음

        dmRepository.save(messageEntity);
        return messageDTO;
    }

    /**
     * 파일을 S3에 업로드하고 메시지로 저장
     *
     * @param file 업로드할 파일
     * @param sender 발신자 이메일
     * @param receiver 수신자 이메일
     * @param wsId 워크스페이스 ID
     * @return 저장된 파일 메시지 DTO
     */
    @Override
    public DmMessageDTO uploadFile(MultipartFile file, String sender, String receiver, Long wsId) {
        String roomId = generateRoomId(wsId, sender, receiver);
        String fileUrl;

        try {
            fileUrl = s3Uploader.upload(file, "chat/" + wsId + "/" + roomId);
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 중 오류 발생", e);
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

        dmRepository.save(messageEntity);
        return mapToDTO(messageEntity);
    }

    /**
     * 특정 방의 모든 메시지를 조회
     *
     * @param wsId 워크스페이스 ID
     * @param roomId 방 ID
     * @return 메시지 DTO 리스트
     */
    @Override
    public List<DmMessageDTO> getMessages(Long wsId, String roomId) {
        return dmRepository.findByRoomIdOrderBySendTimeAsc(roomId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 특정 방의 메시지를 읽음 처리
     *
     * @param wsId 워크스페이스 ID
     * @param sender 발신자 이메일
     * @param receiver 수신자 이메일
     */
    @Override
    public void markMessagesAsRead(Long wsId, String sender, String receiver) {
        String roomId = generateRoomId(wsId, sender, receiver);
        List<DmMessageEntity> messages = dmRepository.findByWsIdAndRoomIdOrderBySendTimeAsc(wsId, roomId);

        messages.forEach(msg -> msg.setRead(true)); // 모든 메시지를 읽음 처리
        dmRepository.saveAll(messages); // 배치로 저장하여 성능 최적화
    }

    /**
     * DTO -> Entity 변환
     *
     * @param dto DmMessageDTO 객체
     * @param roomId 방 ID
     * @return 변환된 Entity 객체
     */
    private DmMessageEntity mapToEntity(DmMessageDTO dto, String roomId) {
        return DmMessageEntity.builder()
                .wsId(dto.getWsId())
                .roomId(roomId)
                .sender(dto.getSender())
                .receiver(dto.getReceiver())
                .dmContent(dto.getDmContent())
                .fileName(dto.getFileName())
                .isFile(dto.isFile())
                .isRead(dto.isRead())
                .build();
    }

    /**
     * Entity -> DTO 변환
     *
     * @param entity DmMessageEntity 객체
     * @return 변환된 DTO 객체
     */
    private DmMessageDTO mapToDTO(DmMessageEntity entity) {
        return DmMessageDTO.builder()
                .dmNumber(entity.getId())
                .wsId(entity.getWsId())
                .roomId(entity.getRoomId())
                .sender(entity.getSender())
                .receiver(entity.getReceiver())
                .dmContent(entity.getDmContent())
                .fileName(entity.getFileName())
                .isFile(entity.isFile())
                .isRead(entity.isRead())
                .sendTime(entity.getSendTime())
                .build();
    }
}
