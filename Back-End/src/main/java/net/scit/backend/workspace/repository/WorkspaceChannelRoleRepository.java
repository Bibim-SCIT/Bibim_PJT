package net.scit.backend.workspace.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceChannelRoleEntity;

public interface WorkspaceChannelRoleRepository extends JpaRepository<WorkspaceChannelRoleEntity,Long>
{

    Optional<WorkspaceChannelRoleEntity> findByWorkspace_wsIdAndChRole(Long wsId, String chRole);

    List<WorkspaceChannelRoleEntity> findByWorkspace_wsId(Long workspaceId);
}
