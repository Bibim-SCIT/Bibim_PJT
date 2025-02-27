package net.scit.backend.workspace.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import net.scit.backend.member.entity.MemberEntity;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "workspace_member")
@Builder
public class WorkspaceMemberEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mWsNumber;

    // WorkspaceEntity와 연결
    @ManyToOne
    @JoinColumn(name = "ws_id", nullable = false)
    private WorkspaceEntity workspace;

    // MemberEntity와 연결
    @ManyToOne
    @JoinColumn(name = "email", nullable = false)
    private MemberEntity member;

    // 워크스페이스 내부 자체 권한
    @ManyToOne
    @JoinColumn(name = "ch_role_number")
    private WorkspaceChannelRoleEntity chRoleNumber;

    // 워크스페이스 사용 권한
    @Builder.Default
    private String wsRole = "owner";

    // 워크스페이스 내부에서 사용하는 닉네임
    private String nickname;

    // 워크스페이스에서 사용하는 프로필 이미지지
    private String profileImage;
}