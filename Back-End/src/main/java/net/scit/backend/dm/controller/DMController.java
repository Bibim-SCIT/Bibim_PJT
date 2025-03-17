package net.scit.backend.dm.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import net.scit.backend.dm.DTO.DmMessageDTO;
import net.scit.backend.dm.service.DmService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dm")
public class DMController {

    private final DmService dmService; // DM 서비스 의존성 주입
    private final SimpMessagingTemplate messagingTemplate; // 메시지 전송을 위한 SimpMessagingTemplate

    /**
     * 이메일에서 사용자명 추출
     *
     * @param email 이메일 주소
     * @return 소문자로 변환된 사용자명
     */
    private String cleanEmail(String email) {
        return email.toLowerCase().split("@")[0];
    }

    /**
     * DM 방 ID 생성
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
     * 메시지 전송 처리 메서드
     *
     * @param messageDTO 클라이언트에서 전송한 메시지 DTO
     */
    @MessageMapping("/dm.sendMessage")
    public void sendMessage(DmMessageDTO messageDTO) {
        DmMessageDTO savedMessage = dmService.processMessage(messageDTO);
        String roomId = generateRoomId(messageDTO.getWsId(), messageDTO.getSender(), messageDTO.getReceiver());
        String destination = "/exchange/dm-exchange/msg." + roomId;
        messagingTemplate.convertAndSend(destination, savedMessage);
    }

    /**
     * 파일 업로드 처리 메서드
     *
     * @param file 업로드할 파일 객체
     * @param sender 발신자 이메일
     * @param receiver 수신자 이메일
     * @param wsId 워크스페이스 ID
     * @return 업로드된 파일 메시지 DTO
     */
    @PostMapping("/upload")
    public DmMessageDTO uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sender") String sender,
            @RequestParam("receiver") String receiver,
            @RequestParam("wsId") Long wsId
    ) {
        return dmService.uploadFile(file, sender, receiver, wsId);
    }

    /**
     * 특정 DM 방의 메시지를 조회하는 메서드
     *
     * @param wsId 워크스페이스 ID
     * @param roomId DM 방 ID
     * @return 해당 방의 메시지 리스트
     */
    @GetMapping("/messages")
    public List<DmMessageDTO> getMessages(
            @RequestParam("wsId") Long wsId,
            @RequestParam("roomId") String roomId
    ) {
        return dmService.getMessages(wsId, roomId);
    }

    /**
     * 메시지를 읽음 처리하는 메서드
     *
     * @param wsId 워크스페이스 ID
     * @param sender 발신자 이메일
     * @param receiver 수신자 이메일
     */
    @PostMapping("/read")
    public void markMessagesAsRead(
            @RequestParam("wsId") Long wsId,
            @RequestParam("sender") String sender,
            @RequestParam("receiver") String receiver
    ) {
        dmService.markMessagesAsRead(wsId, sender, receiver);
    }
}
