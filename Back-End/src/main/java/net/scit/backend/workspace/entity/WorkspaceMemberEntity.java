    package net.scit.backend.workspace.entity;

    import jakarta.persistence.*;
    import lombok.*;
    import net.scit.backend.member.entity.MemberEntity;
    import net.scit.backend.workdata.entity.WorkdataEntity;

    import java.util.HashSet;
    import java.util.Set;

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

        // 워크스페이스 사용 권한
        @Builder.Default
        private String wsRole = "owner";

        // 워크스페이스 내부에서 사용하는 닉네임
        private String nickname;

        // 워크스페이스에서 사용하는 프로필 이미지
        private String profileImage;

        // WorkdataEntity와 Set으로 연결 (중복 방지 및 조인 최적화)
        @OneToMany(mappedBy = "workspaceMember", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        private Set<WorkdataEntity> workdataEntities = new HashSet<>();
    }