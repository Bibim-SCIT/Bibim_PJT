package net.scit.backend.dm.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import net.scit.backend.dm.DTO.DmMessageDTO;
import net.scit.backend.dm.service.DmService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class DMController 
{
    private final DmService dmService;

    @MessageMapping("/dm.sendMessage")
    @SendTo("/exchange/dm-exchange/msg.{roomId}")
    public DmMessageDTO sendMessage(@RequestBody DmMessageDTO messageDTO) {
        return dmService.processMessage(messageDTO);
    }

    @PostMapping("/upload")
    public DmMessageDTO uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("sender") String sender,
                                 @RequestParam("receiver") String receiver, @RequestParam("wsId") Long wsId) {
        return dmService.uploadFile(file, sender, receiver, wsId);
    }

    @GetMapping("/messages")
    public List<DmMessageDTO> getMessages(@RequestParam Long wsId, @RequestParam String sender, @RequestParam String receiver) {
        return dmService.getMessages(wsId, sender, receiver);
    }

    @PostMapping("/read")
    public void markMessagesAsRead(@RequestParam Long wsId, @RequestParam String sender, @RequestParam String receiver) {
        dmService.markMessagesAsRead(wsId, sender, receiver);
    }

}
