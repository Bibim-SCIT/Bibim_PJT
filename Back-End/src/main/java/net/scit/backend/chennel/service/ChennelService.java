package net.scit.backend.chennel.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.chennel.DTO.MessageDTO;

public interface ChennelService {
    MessageDTO processMessage(MessageDTO messageDTO);

    MessageDTO uploadFile(MultipartFile file, String sender, Long channelId);

    List<MessageDTO> getMessagesByChannel( Long channelId);
}
