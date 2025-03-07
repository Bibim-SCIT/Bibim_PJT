package net.scit.backend.dm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.dm.entity.DmMessageEntity;

public interface DmRepository extends JpaRepository<DmMessageEntity, Long>
{
    List<DmMessageEntity> findByWsIdAndSenderAndReceiver(Long wsId, String sender, String receiver);
}
