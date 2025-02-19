package net.scit.backend.workdata.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkdataEntity;

import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class WorkdataDTO {

    private Long dataNumber;
    private Long wsId;
    private String writer;
    private String title;
    private String content;
    private LocalDateTime regdate;

    public static WorkdataDTO toEntity(WorkdataEntity workdataEntity) {
        return WorkdataDTO.builder()
                .dataNumber(workdataEntity.getDataNumber())
                .wsId(workdataEntity.getWsId())
                .writer(workdataEntity.getWriter())
                .title(workdataEntity.getTitle())
                .content(workdataEntity.getContent())
                .regdate(workdataEntity.getRegdate())
                .build();
    }
}
