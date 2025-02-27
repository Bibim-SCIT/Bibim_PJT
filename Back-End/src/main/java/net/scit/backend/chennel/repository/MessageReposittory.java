package net.scit.backend.chennel.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.chennel.entity.MessageEntity;

public interface MessageReposittory extends JpaRepository<MessageEntity,Long>
{

    List<MessageEntity> findByWorkspaceChannelEntity_ChannelNumber(Long channelId);

}
