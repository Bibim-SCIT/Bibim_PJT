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
    private final SimpMessagingTemplate messagingTemplate; // ✅ 메시지 전송을 위한 SimpMessagingTemplate 추가

    // 방 아이디 생성 메소드
    private String cleanEmail(String email) {
        return email.toLowerCase().split("@")[0];
    }
    
    private String generateRoomId(Long wsId, String senderEmail, String receiverEmail) {
        String[] emails = { cleanEmail(senderEmail), cleanEmail(receiverEmail) };
        Arrays.sort(emails);
        return "dm-"+wsId +"-"+ emails[0] + "-" + emails[1];
    }

    // ✅ 메시지 전송 메소드
    @MessageMapping("/dm.sendMessage")
    public void sendMessage(DmMessageDTO messageDTO) {
        DmMessageDTO savedMessage = dmService.processMessage(messageDTO);
        String roomId = generateRoomId(messageDTO.getWsId(), messageDTO.getSender(), messageDTO.getReceiver()); // ✅ roomId 생성
        messagingTemplate.convertAndSend("/exchange/dm-exchange/msg." + roomId, savedMessage);
    }

    // ✅ 파일 업로드 메소드
    @PostMapping("/upload")
    public DmMessageDTO uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("sender") String sender,
            @RequestParam("receiver") String receiver, @RequestParam("wsId") Long wsId) {
        return dmService.uploadFile(file, sender, receiver, wsId);
    }

    // ✅ 메시지 조회 메소드
    @GetMapping("/messages")
    public List<DmMessageDTO> getMessages(@RequestParam("wsId") Long wsId, @RequestParam("roomId") String roomId) {
        log.info("✅ API 요청 수신: "+ " roomId=" + roomId);
        return dmService.getMessages(wsId,roomId);
    }

    // ✅ 읽음 처리 메소드
    @PostMapping("/read")
    public void markMessagesAsRead(@RequestParam("wsId") Long wsId, @RequestParam String sender,
            @RequestParam String receiver) {
        dmService.markMessagesAsRead(wsId, sender, receiver);
    }

}
