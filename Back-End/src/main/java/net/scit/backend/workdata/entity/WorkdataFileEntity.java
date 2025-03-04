package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="workdata_file")
public class WorkdataFileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileNumber;

    /**
     * 부모인 WorkdataEntity와 다대일 관계
     * dataNumber 컬럼을 통해 부모 PK를 참조
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_number")
    private WorkdataEntity workdataEntity;

    private String file;
    private String fileName;
}
