package net.scit.backend.channel.service;

import java.util.List;

import net.scit.backend.channel.DTO.ChatRequestDTO;
import net.scit.backend.channel.DTO.SummaryDTO;
import net.scit.backend.common.dto.ResultDTO;
import net.scit.backend.common.dto.SuccessDTO;
import org.springframework.web.multipart.MultipartFile;

import net.scit.backend.channel.DTO.MessageDTO;

public interface ChannelService {
    MessageDTO processMessage(MessageDTO messageDTO);

    List<MessageDTO> getMessagesByChannel( Long channelId);

    MessageDTO uploadFile(MultipartFile file, String sender, Long channelId);

    ResultDTO<String> summarizeChat(ChatRequestDTO chatRequestDTO);

    ResultDTO<SuccessDTO> summarizeChatUpload(SummaryDTO summaryDTO);
}
