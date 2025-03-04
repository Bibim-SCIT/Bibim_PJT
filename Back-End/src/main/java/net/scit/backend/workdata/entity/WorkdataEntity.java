package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;
import net.scit.backend.workdata.dto.WorkdataDTO;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
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

    // WorkspaceMemberEntity와의 관계 설정 (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "m_ws_number", updatable = false)
    private WorkspaceMemberEntity workspaceMember;

    private String writer;
    private String title;
    private String content;

    @CreationTimestamp
    @Column(name = "reg_date")
    private LocalDateTime regDate;

    /**
     * 자식 1) workdata_file 테이블과의 일대다 관계
     */
    @OneToMany(mappedBy = "workdataEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<WorkdataFileEntity> workdataFile = new HashSet<>();

    /**
     * 자식 2) workdata_file_tag 테이블과의 일대다 관계
     */
    @OneToMany(mappedBy = "workdataEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<WorkDataFileTagEntity> workdataFileTag = new HashSet<>();

    public static WorkdataEntity toEntity(WorkdataDTO workdataDTO, WorkspaceMemberEntity workspaceMemberEntity) {
        return WorkdataEntity.builder()
                .dataNumber(workdataDTO.getDataNumber())
                .workspaceMember(workspaceMemberEntity)
                .writer(workdataDTO.getWriter())
                .title(workdataDTO.getTitle())
                .content(workdataDTO.getContent())
                .regDate(workdataDTO.getRegDate())
                .build();
    }
}
