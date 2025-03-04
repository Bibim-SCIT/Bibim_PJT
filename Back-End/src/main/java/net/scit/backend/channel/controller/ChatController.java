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
    public MessageDTO sendMessage(@Payload MessageDTO messageDTO,@DestinationVariable String channelId) {
        chatService.processMessage(messageDTO); // ✅ 메시지 저장
        return messageDTO;
    }
}
