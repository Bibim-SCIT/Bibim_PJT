package net.scit.backend.workspace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceMemberEntity;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberEntity,Long>
{

}
