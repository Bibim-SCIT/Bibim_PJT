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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_number", nullable = false)
    private WorkdataEntity workdataEntity;

    private String file;
    private String fileName;
}