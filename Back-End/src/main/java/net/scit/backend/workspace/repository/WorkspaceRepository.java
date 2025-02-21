package net.scit.backend.workspace.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import net.scit.backend.workspace.entity.WorkspaceEntity;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface WorkspaceRepository extends JpaRepository<WorkspaceEntity, Long> {

    @Query("SELECT w.wsId FROM WorkspaceEntity w " +
           "JOIN WorkspaceMemberEntity wm ON w.wsId = wm.workspace.wsId " +
           "JOIN MemberEntity m ON wm.member.email = m.email " +
           "WHERE w.wsName = :wsName AND m.email = :email")
    Long findWorkspaceIdByWsNameAndEmail(@Param("wsName") String wsName, @Param("email") String email);


}
