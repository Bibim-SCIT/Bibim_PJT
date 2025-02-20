package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
@Entity
@Table(name="workdata")
public class WorkdataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dataNumber;

    // WorkspaceEntity와의 관계 설정 (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ws_id")
    private WorkspaceEntity workspaceEntity;

    private String writer;
    private String title;
    private String content;

    @CreationTimestamp
    @Column(name="reg_date")
    private LocalDateTime regDate;

    // WorkdataFileEntity와의 관계 설정 (OneToMany, mappedBy 수정)
    @OneToMany(mappedBy = "workdataEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WorkdataFileEntity> workdataFile;

//    @Version  // Optimistic Locking을 위한 버전 필드
//    private Integer version = 0;

    public static WorkdataEntity toEntity(WorkdataDTO workdataDTO, WorkspaceEntity workspaceEntity) {
        return WorkdataEntity.builder()
                .dataNumber(workdataDTO.getDataNumber())
                .workspaceEntity(workspaceEntity)
                .writer(workdataDTO.getWriter())
                .title(workdataDTO.getTitle())
                .content(workdataDTO.getContent())
                .regDate(workdataDTO.getRegDate())
                .build();
    }
}
