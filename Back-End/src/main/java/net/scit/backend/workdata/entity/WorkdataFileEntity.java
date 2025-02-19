package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
@Entity
@Table(name="workdata_file")
public class WorkdataFileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileNumber;

    // WorkdataEntity와의 관계 설정 (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataNumber")
    private WorkdataEntity workdataEntity;

    private String file;
    private String fileName;

    // WorkDataFileTagEntity와의 관계 설정 (OneToMany, mappedBy 수정)
    @OneToMany(mappedBy = "workdataFile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WorkDataFileTagEntity> workdataFileTag;
}
