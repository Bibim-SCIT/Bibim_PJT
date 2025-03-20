package net.scit.backend.channel.controller;

import net.scit.backend.channel.DTO.ChatRequestDTO;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.channel.DTO.MessageDTO;
import net.scit.backend.channel.DTO.SummaryDTO;
import net.scit.backend.channel.service.ChannelService;

import java.util.List;

import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;

@Slf4j
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

    /**
     * 과거 메시지 조회 API
     */
    @GetMapping("/messages/{channelId}")
    public List<MessageDTO> getMessagesByChannel(@PathVariable("channelId") Long channelId) {
        return chatService.getMessagesByChannel(channelId);
    }

    /**
     * 채널 요약 API
     * @param chatRequestDTO
     * @return
     */
    @PostMapping("/summarize")
    public ResponseEntity<ResultDTO<String>> summarizeChat(@RequestBody ChatRequestDTO chatRequestDTO) {
        ResultDTO<String> result = chatService.summarizeChat(chatRequestDTO);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/summarize/upload")
    public ResponseEntity<ResultDTO<SuccessDTO>> summarizeChatUpload(@RequestBody SummaryDTO summaryDTO) {
        ResultDTO<SuccessDTO> result = chatService.summarizeChatUpload(summaryDTO);
        return ResponseEntity.ok(result);
    }
}
