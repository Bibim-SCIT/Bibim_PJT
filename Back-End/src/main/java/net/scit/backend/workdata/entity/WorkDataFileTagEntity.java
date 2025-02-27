package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="workdata_file_tag")
public class WorkDataFileTagEntity {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="file_tag_number", nullable=false)
    private Long fileTagNumber;

    /**
     * 부모인 WorkdataEntity와 다대일 관계
     * file_number가 아니라 data_number로 직접 매핑
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_number", nullable = false)
    private WorkdataEntity workdataEntity;

    private String tag;
}
