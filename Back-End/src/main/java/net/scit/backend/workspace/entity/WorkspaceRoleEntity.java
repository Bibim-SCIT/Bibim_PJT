package net.scit.backend.workspace.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "workspace_role")
public class WorkspaceRoleEntity 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chRoleNumber;

    @ManyToOne
    @JoinColumn(name = "ws_id", nullable = false)
    private WorkspaceEntity workspaceEntity;

    @Builder.Default
    private String chRole = "None";
}