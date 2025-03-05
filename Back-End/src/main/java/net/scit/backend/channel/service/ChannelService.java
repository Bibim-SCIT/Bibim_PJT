package net.scit.backend.channel.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.channel.DTO.MessageDTO;

public interface ChannelService {
    MessageDTO processMessage(MessageDTO messageDTO);

    MessageDTO uploadFile(MultipartFile file, String sender, Long channelId);

    List<MessageDTO> getMessagesByChannel( Long channelId);
}
