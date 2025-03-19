package net.scit.backend.dm.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.dm.DTO.DmMessageDTO;
import net.scit.backend.dm.service.DmService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dm")
public class DMController {

    private final DmService dmService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 이메일 주소에서 사용자명을 추출
     * @param email 이메일 주소
     * @return 이메일 사용자명 (소문자로 변환)
     */
    private String cleanEmail(String email) {
        return email.toLowerCase().split("@")[0];
    }

    /**
     * DM 방 ID 생성
     * @param wsId 워크스페이스 ID
     * @param senderEmail 발신자 이메일
     * @param receiverEmail 수신자 이메일
     * @return 생성된 방 ID
     */
    private String generateRoomId(Long wsId, String senderEmail, String receiverEmail) {
        String[] emails = { cleanEmail(senderEmail), cleanEmail(receiverEmail) };
        Arrays.sort(emails); // 두 이메일 주소를 정렬한 뒤 방 ID 생성
        return "dm-" + wsId + "-" + emails[0] + "-" + emails[1];
    }

    /**
     * 메시지 전송
     * 클라이언트에서 "/app/dm.sendMessage"로 메시지 전송
     * @param messageDTO 전송할 메시지 DTO
     */
    @MessageMapping("/dm.sendMessage")
    public void sendMessage(DmMessageDTO messageDTO) {
        // 메시지 처리 및 저장
        DmMessageDTO savedMessage = dmService.processMessage(messageDTO);

        // 방 ID 생성
        String roomId = generateRoomId(messageDTO.getWsId(), messageDTO.getSender(), messageDTO.getReceiver());

        // 대상 클라이언트에게 메시지 전송
        String destination = "/exchange/dm-exchange/msg." + roomId;
        messagingTemplate.convertAndSend(destination, savedMessage);
    }

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @param sender 발신자
     * @param receiver 수신자
     * @param wsId 워크스페이스 ID
     * @return 저장된 파일 메시지 DTO
     */
    @PostMapping("/upload")
    public DmMessageDTO uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sender") String sender,
            @RequestParam("receiver") String receiver,
            @RequestParam("wsId") Long wsId
    ) {
        log.info("📂 파일 업로드 요청: sender={}, receiver={}, wsId={}", sender, receiver, wsId);
        return dmService.uploadFile(file, sender, receiver, wsId);
    }

    /**
     * 메시지 조회
     * @param wsId 워크스페이스 ID
     * @param roomId 방 ID
     * @return 조회된 메시지 리스트
     */
    @GetMapping("/messages")
    public List<DmMessageDTO> getMessages(
            @RequestParam("wsId") Long wsId,
            @RequestParam("roomId") String roomId
    ) {
        log.info("📩 메시지 조회 요청: wsId={}, roomId={}", wsId, roomId);
        return dmService.getMessages(wsId, roomId);
    }

    /**
     * 메시지 읽음 처리
     * @param wsId 워크스페이스 ID
     * @param sender 발신자
     * @param receiver 수신자
     */
    @PostMapping("/read")
    public void markMessagesAsRead(
            @RequestParam("wsId") Long wsId,
            @RequestParam("sender") String sender,
            @RequestParam("receiver") String receiver
    ) {
        log.info("📖 메시지 읽음 처리 요청: wsId={}, sender={}, receiver={}", wsId, sender, receiver);
        dmService.markMessagesAsRead(wsId, sender, receiver);
    }
}