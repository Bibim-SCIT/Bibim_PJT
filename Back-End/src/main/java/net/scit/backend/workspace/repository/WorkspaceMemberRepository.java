package net.scit.backend.workspace.repository;

import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import net.scit.backend.workspace.entity.WorkspaceMemberEntity;

import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberEntity,Long> {
    Optional<WorkspaceMemberEntity> findByWorkspaceAndMember(WorkspaceEntity workspace, MemberEntity member);
}
