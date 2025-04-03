package net.scit.backend.channel.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import net.scit.backend.channel.DTO.ChatRequestDTO;
import net.scit.backend.channel.DTO.MessageDTO;
import net.scit.backend.channel.DTO.SummaryDTO;
import net.scit.backend.channel.service.ChannelService;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@Tag(name = "Chat API", description = "채팅 관련 API")
public class ChatController {

    private final ChannelService chatService;

    @MessageMapping("/chat.sendMessage.{channelId}")
    @SendTo("/exchange/chat-exchange/msg.{channelId}")
    @Operation(
        summary = "채팅 메시지 전송 (WebSocket)",
        description = "STOMP를 이용해 채널 ID에 따라 메시지를 전송합니다."
    )
    public MessageDTO sendMessage(
            @Parameter(description = "메시지 내용") @Payload MessageDTO messageDTO,
            @Parameter(description = "채널 ID") @DestinationVariable("channelId") String channelId
    ) {
        chatService.processMessage(messageDTO);
        return messageDTO;
    }

    @PostMapping("/upload/{channelId}")
    @Operation(
        summary = "파일 업로드",
        description = "채팅방에 파일을 업로드합니다.",
        responses = {
            @ApiResponse(responseCode = "200", description = "파일 업로드 성공", content = @Content(schema = @Schema(implementation = MessageDTO.class)))
        }
    )
    public MessageDTO uploadFile(
            @Parameter(description = "업로드할 파일") @RequestParam("file") MultipartFile file,
            @Parameter(description = "보낸 사람") @RequestParam("sender") String sender,
            @Parameter(description = "채널 ID") @PathVariable("channelId") Long channelId
    ) {
        return chatService.uploadFile(file, sender, channelId);
    }

    @GetMapping("/messages/{channelId}")
    @Operation(
        summary = "채널 메시지 조회",
        description = "특정 채널의 과거 메시지를 조회합니다.",
        responses = {
            @ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(array = @ArraySchema(schema = @Schema(implementation = MessageDTO.class))))
        }
    )
    public List<MessageDTO> getMessagesByChannel(
            @Parameter(description = "채널 ID") @PathVariable("channelId") Long channelId
    ) {
        return chatService.getMessagesByChannel(channelId);
    }

    @PostMapping("/summarize")
    @Operation(
        summary = "채팅 요약 요청",
        description = "특정 채팅 내용을 OpenAI API를 통해 요약합니다.",
        responses = {
            @ApiResponse(responseCode = "200", description = "요약 성공", content = @Content(schema = @Schema(implementation = ResultDTO.class)))
        }
    )
    public ResponseEntity<ResultDTO<String>> summarizeChat(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "요약할 채팅 데이터",
                required = true,
                content = @Content(schema = @Schema(implementation = ChatRequestDTO.class))
            )
            @RequestBody ChatRequestDTO chatRequestDTO
    ) {
        ResultDTO<String> result = chatService.summarizeChat(chatRequestDTO);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/summarize/upload")
    @Operation(
        summary = "채팅 요약 업로드",
        description = "요약된 데이터를 서버에 저장합니다.",
        responses = {
            @ApiResponse(responseCode = "200", description = "업로드 성공", content = @Content(schema = @Schema(implementation = ResultDTO.class)))
        }
    )
    public ResponseEntity<ResultDTO<SuccessDTO>> summarizeChatUpload(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "요약 저장 데이터",
                required = true,
                content = @Content(schema = @Schema(implementation = SummaryDTO.class))
            )
            @RequestBody SummaryDTO summaryDTO
    ) {
        ResultDTO<SuccessDTO> result = chatService.summarizeChatUpload(summaryDTO);
        return ResponseEntity.ok(result);
    }
}
