package net.scit.backend.dm.service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.dm.DTO.DmMessageDTO;

public interface DmService 
{
    DmMessageDTO processMessage(DmMessageDTO messageDTO);

    DmMessageDTO uploadFile(MultipartFile file, String sender, String receiver, Long wsId);

    List<DmMessageDTO> getMessages(Long wsId, String roomId);

    void markMessagesAsRead(Long wsId, String sender, String receiver);
}
