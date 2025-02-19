package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;
import net.scit.backend.workdata.dto.WorkdataDTO;
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

    private Long wsId;
    private String writer;
    private String title;
    private String content;
    private LocalDateTime regdate;

    // WorkdataFileEntity와의 관계 설정 (OneToMany, mappedBy 수정)
    @OneToMany(mappedBy = "workdataEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WorkdataFileEntity> workdataFile;

    public static WorkdataEntity toEntity(WorkdataDTO workdataDTO) {
        return WorkdataEntity.builder()
                .dataNumber(workdataDTO.getDataNumber())
                .wsId(workdataDTO.getWsId())
                .writer(workdataDTO.getWriter())
                .title(workdataDTO.getTitle())
                .content(workdataDTO.getContent())
                .regdate(workdataDTO.getRegdate())
                .build();
    }
}
