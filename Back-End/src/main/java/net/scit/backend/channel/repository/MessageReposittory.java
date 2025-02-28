package net.scit.backend.channel.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.channel.entity.MessageEntity;

public interface MessageReposittory extends JpaRepository<MessageEntity,Long>
{

    List<MessageEntity> findByWorkspaceChannelEntity_ChannelNumber(Long channelId);

}
