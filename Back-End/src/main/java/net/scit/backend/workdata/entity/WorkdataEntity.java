package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
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


    // WorkdataFileEntity와의 관계 설정 (OneToMany, mappedBy 수정) => 1차 수정: set으로 변경(파일, 태그 두 요소를 한번에 조회하기 때문에 중복 허용 가능한 set)
    @OneToMany(mappedBy = "workdataEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<WorkdataFileEntity> workdataFile = new HashSet<>();


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
