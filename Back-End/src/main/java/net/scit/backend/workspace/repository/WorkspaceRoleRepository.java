package net.scit.backend.workspace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceRoleEntity;

public interface WorkspaceRoleRepository extends JpaRepository<WorkspaceRoleEntity,Long>
{

    Optional<WorkspaceRoleEntity> findByWorkspace_wsIdAndChRole(Long wsId, String chRole);

}
