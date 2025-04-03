package net.scit.backend.dm.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import net.scit.backend.dm.DTO.DmMessageDTO;
import net.scit.backend.dm.service.DmService;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dm")
@Tag(name = "DM API", description = "1:1 DM(Direct Message) 관련 API")
public class DMController {

    private final DmService dmService;
    private final SimpMessagingTemplate messagingTemplate;

    private String cleanEmail(String email) {
        return email.toLowerCase().split("@")[0];
    }

    private String generateRoomId(Long wsId, String senderEmail, String receiverEmail) {
        String[] emails = { cleanEmail(senderEmail), cleanEmail(receiverEmail) };
        Arrays.sort(emails);
        return "dm-" + wsId + "-" + emails[0] + "-" + emails[1];
    }

    @MessageMapping("/dm.sendMessage")
    @SendTo("/exchange/dm-exchange/msg.{roomId}")
    @Operation(
            summary = "DM 메시지 전송 (WebSocket)",
            description = "1:1 DM 메시지를 WebSocket을 통해 전송합니다. 클라이언트는 /app/dm.sendMessage로 메시지를 전송합니다."
    )
    public void sendMessage(
            @Parameter(description = "DM 메시지 정보") DmMessageDTO messageDTO
    ) {
        DmMessageDTO savedMessage = dmService.processMessage(messageDTO);
        String roomId = generateRoomId(messageDTO.getWsId(), messageDTO.getSender(), messageDTO.getReceiver());
        String destination = "/exchange/dm-exchange/msg." + roomId;
        messagingTemplate.convertAndSend(destination, savedMessage);
    }

    @PostMapping("/upload")
    @Operation(
            summary = "파일 업로드",
            description = "DM 채팅에 파일을 업로드합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "업로드 성공", content = @Content(schema = @Schema(implementation = DmMessageDTO.class)))
            }
    )
    public DmMessageDTO uploadFile(
            @Parameter(description = "업로드할 파일") @RequestParam("file") MultipartFile file,
            @Parameter(description = "보낸 사람 이메일") @RequestParam("sender") String sender,
            @Parameter(description = "받는 사람 이메일") @RequestParam("receiver") String receiver,
            @Parameter(description = "워크스페이스 ID") @RequestParam("wsId") Long wsId
    ) {
        log.info("📂 파일 업로드 요청: sender={}, receiver={}, wsId={}", sender, receiver, wsId);
        return dmService.uploadFile(file, sender, receiver, wsId);
    }

    @GetMapping("/messages")
    @Operation(
            summary = "DM 메시지 조회",
            description = "워크스페이스와 DM 방 ID를 기준으로 기존 DM 메시지를 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(array = @ArraySchema(schema = @Schema(implementation = DmMessageDTO.class))))
            }
    )
    public List<DmMessageDTO> getMessages(
            @Parameter(description = "워크스페이스 ID") @RequestParam("wsId") Long wsId,
            @Parameter(description = "DM 방 ID") @RequestParam("roomId") String roomId
    ) {
        log.info("📩 메시지 조회 요청: wsId={}, roomId={}", wsId, roomId);
        return dmService.getMessages(wsId, roomId);
    }

    @PostMapping("/read")
    @Operation(
            summary = "DM 메시지 읽음 처리",
            description = "워크스페이스 ID, 발신자, 수신자를 기준으로 메시지를 읽음 처리합니다."
    )
    public void markMessagesAsRead(
            @Parameter(description = "워크스페이스 ID") @RequestParam("wsId") Long wsId,
            @Parameter(description = "보낸 사람 이메일") @RequestParam("sender") String sender,
            @Parameter(description = "받는 사람 이메일") @RequestParam("receiver") String receiver
    ) {
        log.info("📖 메시지 읽음 처리 요청: wsId={}, sender={}, receiver={}", wsId, sender, receiver);
        dmService.markMessagesAsRead(wsId, sender, receiver);
    }
}
