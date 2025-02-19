package net.scit.backend.workspace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceRoleEntity;

public interface WorkspaceRoleRepository extends JpaRepository<WorkspaceRoleEntity,Long>
{

}
