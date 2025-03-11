package net.scit.backend.workspace.repository;

import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;
import net.scit.backend.member.entity.MemberEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMemberEntity,Long> {
    Optional<WorkspaceMemberEntity> findByWorkspaceAndMember(WorkspaceEntity workspace, MemberEntity member);

    List<WorkspaceMemberEntity> findAllByMemberEmail(String email);

    // 수정 전: void deleteByWorkspaceWsIdAndMemberEmail(Long wsId, String email);
    void deleteByWorkspace_wsIdAndMember_Email(Long wsId, String email);

    // 수정 전: Optional<WorkspaceMemberEntity> findByWorkspaceWsIdAndMemberEmail(Long workspaceId, String email);
    Optional<WorkspaceMemberEntity> findByWorkspace_wsIdAndMember_Email(Long workspaceId, String email);

    // 수정 전: List<WorkspaceMemberEntity> findByWorkspaceWsId(Long wsId);
    List<WorkspaceMemberEntity> findByWorkspace_wsId(Long wsId);

    List<WorkspaceMemberEntity> findByChRoleNumber_ChRoleNumber(Long chRoleNumber);

    List<WorkspaceMemberEntity> findByWorkspace(WorkspaceEntity workspace);
  
    List<WorkspaceMemberEntity> findByWorkspace_wsIdAndChRoleNumber_ChRoleNumber(Long wsId,Long chRoleNumber);

    // 주어진 워크스페이스 ID와 이메일로 소속 여부 검증
    Optional<WorkspaceMemberEntity> findByWorkspace_WsIdAndMember_Email(Long wsId, String email);


    // 특정 워크스페이스에 소속된 모든 멤버 조회
    List<WorkspaceMemberEntity> findByWorkspace_WsId(Long wsId);

    //게시물 등록 시 이메일 가져옴
    Optional<WorkspaceMemberEntity> findByMember_EmailAndWorkspace_WsId(String email, Long wsId); // ✅ 수정

    // ✅ 특정 워크스페이스에 소속된 모든 멤버 조회 (JPQL)
    // ✅ 특정 워크스페이스에 소속된 모든 멤버 조회 (네이티브 쿼리)
    @Query(value = "SELECT * FROM workspace_member WHERE ws_id = :workspaceId", nativeQuery = true)
    List<WorkspaceMemberEntity> findMembersByWorkspaceIdNative(@Param("workspaceId") Long workspaceId);

    // ✅ 특정 워크스페이스에 속한 모든 멤버 삭제
    @Modifying
    @Transactional
    @Query("DELETE FROM WorkspaceMemberEntity wm WHERE wm.workspace.wsId = :wsId")
    void deleteByWorkspace(@Param("wsId") Long wsId);


}
