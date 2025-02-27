package net.scit.backend.chennel.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import net.scit.backend.chennel.DTO.MessageDTO;
import net.scit.backend.chennel.service.ChennelService;

@RestController
@RequiredArgsConstructor
public class ChannelController {
    
    private final ChennelService channelService;

    /**
     * 웹소켓을 통해 채널별로 메시지를 전송하는 엔드포인트
     * 특정 채널의 사용자만 해당 메시지를 받을 수 있음
     */
    @PostMapping("/chat/sendMessage/{channelId}")
    // @MessageMapping("/chat/sendMessage/{channelId}")
    // @SendTo("/topic/channel/{channelId}")
    public MessageDTO sendMessage(@RequestParam MessageDTO messageDTO) {
        return channelService.processMessage(messageDTO);
    }

    /**
     * 파일을 업로드하고 해당 URL을 메시지로 저장하는 엔드포인트
     */
    @PostMapping("/chat/upload/{channelId}")
    public MessageDTO uploadFile(@RequestParam("file") MultipartFile file,
            @RequestParam("sender") String sender,
            @RequestParam("channelNumber") Long channelId) throws IOException {
        return channelService.uploadFile(file, sender, channelId);
    }

    /**
     * 특정 채널의 메시지를 가져오는 엔드포인트
     */
    @GetMapping("/chat/messages/{channelId}")
    public List<MessageDTO> getMessages(@PathVariable Long channelId) {
        return channelService.getMessagesByChannel(channelId);
    }
}
