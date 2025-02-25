package net.scit.backend.workspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "workspace_channel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceChannelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "channel_number")
    private Long channelNumber;

    @ManyToOne
    @JoinColumn(name = "ch_role_number")
    private WorkspaceChannelRoleEntity workspaceRole;

    @ManyToOne
    @JoinColumn(name = "ws_id", nullable = false)
    private WorkspaceEntity workspace;

    @Column(name = "channel_name", nullable = false)
    private String channelName;
}
