package net.scit.backend.channel.controller;

import net.scit.backend.channel.DTO.MessageDTO;
import net.scit.backend.channel.service.ChannelService;
import java.util.List;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChannelService chatService; // 채널 서비스 의존성 주입

    /**
     * 채널로 텍스트 메시지를 전송하는 메서드
     *
     * @param messageDTO 메시지 데이터 객체
     * @param channelId  전송할 채널의 ID
     * @return 처리된 메시지 DTO
     */
    @MessageMapping("/chat.sendMessage.{channelId}")
    @SendTo("/exchange/chat-exchange/msg.{channelId}")
    public MessageDTO sendMessage(
            @Payload MessageDTO messageDTO,
            @DestinationVariable("channelId") String channelId
    ) {
        chatService.processMessage(messageDTO); // 메시지 처리 로직 수행
        return messageDTO; // 처리된 메시지 반환
    }

    /**
     * 파일을 업로드하고 해당 채널에 첨부 메시지를 전송하는 메서드
     *
     * @param file      업로드할 파일 객체
     * @param sender    파일을 보낸 사용자 이름
     * @param channelId 파일이 전송될 채널 ID
     * @return 업로드된 파일 정보를 담은 메시지 DTO
     */
    @PostMapping("/upload/{channelId}")
    public MessageDTO uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sender") String sender,
            @PathVariable("channelId") Long channelId
    ) {
        return chatService.uploadFile(file, sender, channelId); // 파일 업로드 처리
    }

    /**
     * 특정 채널의 과거 메시지를 조회하는 API
     *
     * @param channelId 조회할 채널의 ID
     * @return 해당 채널의 메시지 목록
     */
    @GetMapping("/messages/{channelId}")
    public List<MessageDTO> getMessagesByChannel(@PathVariable("channelId") Long channelId) {
        return chatService.getMessagesByChannel(channelId); // 채널의 메시지 조회
    }
}
