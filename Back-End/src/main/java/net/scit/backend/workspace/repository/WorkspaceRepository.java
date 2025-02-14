package net.scit.backend.workspace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceEntity;

public interface WorkspaceRepository extends JpaRepository<WorkspaceEntity,Long>
{

}
