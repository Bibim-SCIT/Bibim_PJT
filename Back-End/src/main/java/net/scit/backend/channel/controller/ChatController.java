package net.scit.backend.channel.controller;

import net.scit.backend.channel.DTO.MessageDTO;
import net.scit.backend.channel.service.*;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChannelService chatService;

    @MessageMapping("/chat.sendMessage.{channelId}")
    @SendTo("/exchange/chat-exchange/msg.{channelId}")
    public MessageDTO sendMessage(
            @Payload MessageDTO messageDTO, 
            @DestinationVariable("channelId") String channelId // ✅ 변수명을 명시적으로 지정
    ) 
    {
        chatService.processMessage(messageDTO);
        return messageDTO;
    }
    
}
