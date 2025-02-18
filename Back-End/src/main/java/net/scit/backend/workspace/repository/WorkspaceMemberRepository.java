package net.scit.backend.workspace.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceMemberEntity;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberEntity,Long>
{

    List<WorkspaceMemberEntity> findAllByMemberEmail(String email);


}
