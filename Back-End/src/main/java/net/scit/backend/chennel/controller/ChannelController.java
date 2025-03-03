package net.scit.backend.chennel.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import net.scit.backend.chennel.DTO.MessageDTO;
import net.scit.backend.chennel.service.ChennelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.scit.backend.auth.AuthUtil;


import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChannelController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChennelService chennelService;

    /**
     * 웹소켓을 통해 채널별로 메시지를 전송하는 엔드포인트
     * 인증된 사용자만 메시지를 보낼 수 있음
     */
@MessageMapping("/chat/sendMessage/{channelId}")
public void sendMessage(@Payload MessageDTO messageDTO, 
                        @DestinationVariable("channelId") Long channelId, 
                        Principal principal, // ✅ STOMP 인증된 사용자 가져오기
                        @Headers Map<String, Object> headers) {  // ✅ STOMP 세션 정보 가져오기

    String username = null;

    // ✅ 1차: Principal에서 username 가져오기
    if (principal != null) {
        username = principal.getName();
        log.info("✅ Principal에서 가져온 사용자: {}", username);
    }

    // ✅ 2차: STOMP 세션에서 username 가져오기
    if (username == null) {
        username = (String) headers.get("simpSessionAttributes.username");
        log.info("✅ STOMP 세션에서 가져온 사용자: {}", username);
    }

    // ✅ 3차: SecurityContextHolder에서 username 가져오기 (최후의 방법)
    if (username == null) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            username = authentication.getName();
            log.info("✅ SecurityContext에서 가져온 사용자: {}", username);
        }
    }

    if (username == null) {
        log.warn("❌ WebSocket 인증 실패: 사용자 정보 없음");
        return;
    }

    messageDTO.setSender(username);
    messageDTO.setChannelNumber(channelId);

    log.info("📥 받은 메시지: {} (채널: {}, 보낸 사람: {})", messageDTO.getContent(), channelId, username);

    MessageDTO processedMessage = chennelService.processMessage(messageDTO);

    log.info("📤 STOMP 브로커로 메시지 전송: {}", processedMessage.getContent());

    messagingTemplate.convertAndSend("/topic/channel/" + processedMessage.getChannelNumber(), processedMessage);
}

    

}

// import java.util.List;

// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.ModelAttribute;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// // import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile;

// import io.jsonwebtoken.io.IOException;
// import lombok.RequiredArgsConstructor;
// import net.scit.backend.channel.DTO.MessageDTO;
// import net.scit.backend.channel.service.ChannelService;

// @RestController
// @RequiredArgsConstructor
// public class ChannelController {

// private final ChannelService channelService;

// /**
// * 웹소켓을 통해 채널별로 메시지를 전송하는 엔드포인트
// * 특정 채널의 사용자만 해당 메시지를 받을 수 있음
// */
// @PostMapping("/chat/sendMessage/{channelId}")
// // @MessageMapping("/chat/sendMessage/{channelId}")
// // @SendTo("/topic/channel/{channelId}")
// public MessageDTO sendMessage(@ModelAttribute MessageDTO messageDTO) {
// return channelService.processMessage(messageDTO);
// }

// /**
// * 파일을 업로드하고 해당 URL을 메시지로 저장하는 엔드포인트
// */
// @PostMapping("/chat/upload/{channelId}")
// public MessageDTO uploadFile(@RequestParam("file") MultipartFile file,
// @RequestParam("sender") String sender,
// @RequestParam("channelNumber") Long channelId) throws IOException {
// return channelService.uploadFile(file, sender, channelId);
// }

// /**
// * 특정 채널의 메시지를 가져오는 엔드포인트
// */
// @GetMapping("/chat/messages/{channelId}")
// public List<MessageDTO> getMessages(@PathVariable Long channelId) {
// return channelService.getMessagesByChannel(channelId);
// }

// }
