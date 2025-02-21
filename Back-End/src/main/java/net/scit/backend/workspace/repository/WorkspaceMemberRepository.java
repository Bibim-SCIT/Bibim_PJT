package net.scit.backend.workspace.repository;

import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberEntity,Long> {
    Optional<WorkspaceMemberEntity> findByWorkspaceAndMember(WorkspaceEntity workspace, MemberEntity member);

    List<WorkspaceMemberEntity> findAllByMemberEmail(String email);

    void deleteByWsNameAndEmail(String wsName, String email);

    Optional<WorkspaceMemberEntity> findWorkspaceIdByWsNameAndEmail(String wsName, String email);

    List<WorkspaceMemberEntity> findByWsId(Long wsId);
}
