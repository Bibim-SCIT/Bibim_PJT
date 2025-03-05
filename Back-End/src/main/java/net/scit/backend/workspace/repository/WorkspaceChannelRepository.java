package net.scit.backend.workspace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceChannelEntity;

public interface WorkspaceChannelRepository extends JpaRepository<WorkspaceChannelEntity,Long>{
    //채널 생성
    boolean existsByWorkspace_wsIdAndChannelName(Long workspaceId, String channelName);
}
