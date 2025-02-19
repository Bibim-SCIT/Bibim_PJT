package net.scit.backend.workdata.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
@Entity
@Table(name="workdata_file_tag")
public class WorkDataFileTagEntity {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="file_tag_number", nullable=false)
    private Long fileTagNumber;

    // WorkdataFileEntity와의 관계 설정 (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_number", nullable = false)
    private WorkdataFileEntity workdataFile;

    private String tag;
}
