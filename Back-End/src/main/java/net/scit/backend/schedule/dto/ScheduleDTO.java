package net.scit.backend.schedule.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDTO {

    private Long wsId;
    private String tag1;
    private String tag2;
    private String tag3;
    private String scheduleTitle;
    private String scheduleContent;
    private LocalDateTime scheduleStartDate;
    private LocalDateTime scheduleFinishDate;
}
