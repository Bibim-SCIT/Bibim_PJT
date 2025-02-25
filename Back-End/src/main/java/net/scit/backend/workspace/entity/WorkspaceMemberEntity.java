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

    @ManyToOne
    @JoinColumn(name = "ch_role_number")
    private WorkspaceChannelRoleEntity chRoleNumber;

    @Builder.Default
    private String wsRole = "owner";

    private String nickname;
    private String profileImage;
}