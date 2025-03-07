package net.scit.backend.channel.controller;

import net.scit.backend.channel.DTO.MessageDTO;
import net.scit.backend.channel.service.ChannelService;
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

    private final ChannelService chatService;

    /**
     * 텍스트 메시지 처리
     */
    @MessageMapping("/chat.sendMessage.{channelId}")
    @SendTo("/exchange/chat-exchange/msg.{channelId}")
    public MessageDTO sendMessage(
            @Payload MessageDTO messageDTO,
            @DestinationVariable("channelId") String channelId
    ) {
        chatService.processMessage(messageDTO);
        return messageDTO;
    }

    /**
     * 파일 업로드 처리
     */
    @PostMapping("/upload/{channelId}")
    public MessageDTO uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sender") String sender,
            @PathVariable("channelId") Long channelId
    ) {
        return chatService.uploadFile(file, sender, channelId);
    }
}
