package net.scit.backend.schedule.entity;

import jakarta.persistence.*;
import lombok.*;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Entity
@Table(name = "large_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LargeTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long largeTagNumber;

    @ManyToOne
    @JoinColumn(name = "ws_id")
    private WorkspaceEntity workspace;

    private String tagName;
    private String tagColor;
}
