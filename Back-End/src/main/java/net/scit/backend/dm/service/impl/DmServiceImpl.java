package net.scit.backend.dm.service.impl;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import net.scit.backend.workspace.repository.WorkspaceMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.messaging.simp.SimpMessagingTemplate; // ✅ 추가


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
    private final DmRepository dmRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final S3Uploader s3Uploader;
    private final SimpMessagingTemplate messagingTemplate; // ✅ WebSocket 메시지 전송을 위한 객체 추가


    /**
     * 이메일에서 사용자명을 추출
     * @param email 이메일 주소
     * @return 사용자명
     */
    private String cleanEmail(String email) {
        return email.toLowerCase().split("@")[0];
    }

    /**
     * DM 방 ID 생성
     * @param wsId 워크스페이스 ID
     * @param senderEmail 발신자 이메일
     * @param receiverEmail 수신자 이메일
     * @return 방 ID
     */
    private String generateRoomId(Long wsId, String senderEmail, String receiverEmail) {
        String[] emails = { cleanEmail(senderEmail), cleanEmail(receiverEmail) };
        Arrays.sort(emails);
        return "dm-" + wsId + "-" + emails[0] + "-" + emails[1];
    }

    /**
     * 메시지를 처리하고 저장
     * @param messageDTO 메시지 DTO
     * @return 저장된 메시지 DTO
     */
    @Override
    public DmMessageDTO processMessage(DmMessageDTO messageDTO) {
        if (messageDTO.isFile()) {
            log.info("📂 파일 메시지는 processMessage에서 처리하지 않음.");
            return messageDTO;
        }

        String roomId = generateRoomId(messageDTO.getWsId(), messageDTO.getSender(), messageDTO.getReceiver());

        DmMessageEntity messageEntity = mapToEntity(messageDTO, roomId); // DTO -> Entity 변환
        messageEntity.setRead(false); // 기본값으로 읽지 않음 설정

        dmRepository.save(messageEntity);

        return messageDTO;
    }

    /**
     * 파일 업로드 처리 및 메시지 저장
     * @param file 업로드할 파일
     * @param sender 발신자
     * @param receiver 수신자
     * @param wsId 워크스페이스 ID
     * @return 저장된 메시지 DTO
     */
    @Override
    public DmMessageDTO uploadFile(MultipartFile file, String sender, String receiver, Long wsId) {
        String roomId = generateRoomId(wsId, sender, receiver);
        String fileUrl;

        try {
            // S3에 파일 업로드
            fileUrl = s3Uploader.upload(file, "chat/" + wsId + "/" + roomId);
        } catch (IOException e) {
            log.error("❌ 파일 업로드 실패: {}", e.getMessage());
            throw new RuntimeException("파일 업로드 중 오류 발생", e);
        }

        // 파일 업로드 후 메시지 엔티티 생성 및 저장
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

        DmMessageDTO messageDTO = mapToDTO(messageEntity);
        messagingTemplate.convertAndSend("/exchange/dm-exchange/msg." + roomId, messageDTO);

        return mapToDTO(messageEntity); // Entity -> DTO 변환
    }

    /**
     * 특정 방의 메시지를 조회
     * @param wsId 워크스페이스 ID
     * @param roomId 방 ID
     * @return 메시지 DTO 리스트
     */
    @Override
    public List<DmMessageDTO> getMessages(Long wsId, String roomId) {
        List<DmMessageEntity> messages = dmRepository.findByRoomIdOrderBySendTimeAsc(roomId);

        // 리스트를 DTO로 변환
        return messages.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * 특정 방의 메시지를 읽음 처리
     * @param wsId 워크스페이스 ID
     * @param sender 발신자
     * @param receiver 수신자
     */
    @Override
    public void markMessagesAsRead(Long wsId, String sender, String receiver) {
        String roomId = generateRoomId(wsId, sender, receiver);

        // 메시지 읽기 처리
        List<DmMessageEntity> messages = dmRepository.findByWsIdAndRoomIdOrderBySendTimeAsc(wsId, roomId);
        messages.forEach(msg -> msg.setRead(true)); // 메시지 읽음 처리

        dmRepository.saveAll(messages); // 변경된 메시지를 배치 저장
        log.info("✅ 메시지 읽음 처리 완료: roomId={}, sender={}, receiver={}", roomId, sender, receiver);
    }

    // ----------- 공통 매핑 메서드 -----------

    /**
     * DmMessageDTO -> DmMessageEntity 변환
     * @param dto DTO 객체
     * @param roomId 방 ID
     * @return 변환된 Entity
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
     * DmMessageEntity -> DmMessageDTO 변환
     * @param entity Entity 객체
     * @return 변환된 DTO
     */
    private DmMessageDTO mapToDTO(DmMessageEntity entity) {
        WorkspaceMemberEntity workspaceMember = workspaceMemberRepository.findByWorkspace_wsIdAndMember_Email(entity.getWsId(),entity.getSender())
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));
        return DmMessageDTO.builder()
                .dmNumber(entity.getId())
                .wsId(entity.getWsId())
//                .nickname(workspaceMember.getNickname())
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