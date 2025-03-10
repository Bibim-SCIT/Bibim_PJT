package net.scit.backend.mypage.dto;

import lombok.*;
import net.scit.backend.schedule.type.ScheduleStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyScheduleDTO {

    private Long wsId;
    private String wsName;
    private Long scheduleNumber;
    private String tag1;
    private String tag2;
    private String tag3;
    private String scheduleTitle;
    private String scheduleContent;
    private ScheduleStatus scheduleStatus;
    private LocalDateTime scheduleStartDate;
    private LocalDateTime scheduleFinishDate;
    private LocalDateTime scheduleModifytime;
    private String color;
}

