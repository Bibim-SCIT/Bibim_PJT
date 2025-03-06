package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="workdata")
public class WorkdataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dataNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "m_ws_number", updatable = false, nullable = false)
    private WorkspaceMemberEntity workspaceMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ws_id", updatable = false, nullable = false)
    private WorkspaceEntity workspace;

    private String writer;
    private String title;
    private String content;

    @CreationTimestamp
    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @OneToMany(mappedBy = "workdataEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<WorkdataFileEntity> workdataFiles;

    @OneToMany(mappedBy = "workdataEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<WorkDataFileTagEntity> workdataFileTags;
}