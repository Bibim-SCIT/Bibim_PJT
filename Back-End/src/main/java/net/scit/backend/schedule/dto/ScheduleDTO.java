package net.scit.backend.schedule.dto;

import lombok.*;
import net.scit.backend.schedule.entity.*;
import net.scit.backend.schedule.type.ScheduleStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDTO {

    private Long wsId;
    private Long scheduleNumber;
    private String nickname;
    private String tag1;
    private String tag2;
    private String tag3;
    private String scheduleTitle;
    private String scheduleContent;
    private ScheduleStatus scheduleStatus;
    private LocalDateTime scheduleStartDate;
    private LocalDateTime scheduleFinishDate;

    public static ScheduleDTO toDTO(ScheduleEntity scheduleEntity, String nickname, ScheduleTagEntity scheduleTagEntity) {
        return ScheduleDTO.builder()
                .wsId(scheduleEntity.getWorkspace().getWsId())
                .scheduleNumber(scheduleEntity.getScheduleNumber())
                .nickname(nickname)
                .tag1(scheduleTagEntity.getLargeTag().getTagName())
                .tag2(scheduleTagEntity.getMediumTag().getTagName())
                .tag3(scheduleTagEntity.getSmallTag().getTagName())
                .scheduleTitle(scheduleEntity.getScheduleTitle())
                .scheduleContent(scheduleEntity.getScheduleContent())
                .scheduleStatus(scheduleEntity.getScheduleStatus())
                .scheduleStartDate(scheduleEntity.getScheduleStartdate())
                .scheduleFinishDate(scheduleEntity.getScheduleFinishdate())
                .build();
    }
}
