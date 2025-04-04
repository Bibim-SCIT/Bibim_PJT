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
    private String profileImage;
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

    public static ScheduleDTO toDTO(ScheduleEntity scheduleEntity, String nickname, String profileImage, ScheduleTagEntity scheduleTagEntity) {

        String tag2 = (scheduleTagEntity.getMediumTag() != null) ? scheduleTagEntity.getMediumTag().getTagName() : null; // null 처리 추가
        String tag3 = (scheduleTagEntity.getSmallTag() != null) ? scheduleTagEntity.getSmallTag().getTagName() : null; // null 처리 추가

        return ScheduleDTO.builder()
                .wsId(scheduleEntity.getWorkspace().getWsId())
                .scheduleNumber(scheduleEntity.getScheduleNumber())
                .nickname(nickname)
                .profileImage(profileImage)
                .tag1(scheduleTagEntity.getLargeTag().getTagName())
                .tag2(tag2)
                .tag3(tag3)
                .scheduleTitle(scheduleEntity.getScheduleTitle())
                .scheduleContent(scheduleEntity.getScheduleContent())
                .scheduleStatus(scheduleEntity.getScheduleStatus())
                .scheduleStartDate(scheduleEntity.getScheduleStartdate())
                .scheduleFinishDate(scheduleEntity.getScheduleFinishdate())
                .scheduleModifytime(scheduleEntity.getScheduleModifytime())
                .color(scheduleTagEntity.getLargeTag().getTagColor())
                .build();
    }

    public static ScheduleDTO toDTO(ScheduleEntity scheduleEntity, String nickname, String profileImage) {
        return ScheduleDTO.builder()
                .wsId(scheduleEntity.getWorkspace().getWsId())
                .scheduleNumber(scheduleEntity.getScheduleNumber())
                .nickname(nickname)
                .profileImage(profileImage)
                .tag1(null)
                .tag2(null)
                .tag3(null)
                .scheduleTitle(scheduleEntity.getScheduleTitle())
                .scheduleContent(scheduleEntity.getScheduleContent())
                .scheduleStatus(scheduleEntity.getScheduleStatus())
                .scheduleStartDate(scheduleEntity.getScheduleStartdate())
                .scheduleFinishDate(scheduleEntity.getScheduleFinishdate())
                .scheduleModifytime(scheduleEntity.getScheduleModifytime())
                .color("#DBE2EF") // 태그가 없을 때 디폴트 색상
                .build();
    }
}
