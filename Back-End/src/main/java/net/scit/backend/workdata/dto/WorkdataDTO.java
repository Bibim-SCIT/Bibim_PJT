package net.scit.backend.workdata.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workspace.entity.WorkspaceEntity;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class WorkdataDTO {

    private Long dataNumber;
    private String writer;
    private String title;
    private String content;
    @Builder.Default
    private LocalDateTime regDate = LocalDateTime.now();

    public static WorkdataDTO toDTO(WorkdataEntity workdataEntity) {
        return WorkdataDTO.builder()
                .dataNumber(workdataEntity.getDataNumber())
                .writer(workdataEntity.getWriter())
                .title(workdataEntity.getTitle())
                .content(workdataEntity.getContent())
                .regDate(workdataEntity.getRegDate())
                .build();
    }
}
