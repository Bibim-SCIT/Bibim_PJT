package net.scit.backend.workspace.entity;

import java.util.*;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "workspace_role")
public class WorkspaceChannelRoleEntity 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chRoleNumber;

    @ManyToOne
    @JoinColumn(name = "ws_id", nullable = false)
    private WorkspaceEntity workspace;

    @Builder.Default
    private String chRole = "None";

    @OneToMany(mappedBy = "workspaceRole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkspaceChannelEntity> channels = new ArrayList<>();
}