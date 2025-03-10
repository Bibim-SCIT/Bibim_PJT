    package net.scit.backend.schedule.entity;

    import jakarta.persistence.*;
    import lombok.*;
    import net.scit.backend.member.entity.MemberEntity;
    import net.scit.backend.schedule.dto.ScheduleDTO;
    import net.scit.backend.schedule.type.ScheduleStatus;
    import net.scit.backend.schedule.type.ScheduleStatusConverter;
    import net.scit.backend.workspace.entity.WorkspaceEntity;
    import org.hibernate.annotations.CreationTimestamp;

    import java.time.LocalDateTime;

    @Entity
    @Table(name = "schedule")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder(toBuilder = true)
    public class ScheduleEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long scheduleNumber;

        @ManyToOne
        @JoinColumn(name = "email")
        private MemberEntity member;

        @ManyToOne
        @JoinColumn(name = "ws_id")
        private WorkspaceEntity workspace;

        @ManyToOne
        @JoinColumn(name = "scheduleTagNumber")
        private ScheduleTagEntity scheduleTag;

        private String scheduleTitle;
        private String scheduleContent;

        @Convert(converter = ScheduleStatusConverter.class)
        private ScheduleStatus scheduleStatus;

        @CreationTimestamp
        private LocalDateTime scheduleUptime;
        @CreationTimestamp
        private LocalDateTime scheduleModifytime;
        private LocalDateTime scheduleStartdate;
        private LocalDateTime scheduleFinishdate;

        public static ScheduleEntity toEntity(ScheduleDTO scheduleDTO, WorkspaceEntity workspace,
                                              ScheduleTagEntity scheduleTagEntity, ScheduleStatus scheduleStatus) {
            return ScheduleEntity.builder()
                    .workspace(workspace)
                    .scheduleTag(scheduleTagEntity)
                    .scheduleTitle(scheduleDTO.getScheduleTitle())
                    .scheduleContent(scheduleDTO.getScheduleContent())
                    .scheduleStatus(scheduleStatus)
                    .scheduleStartdate(scheduleDTO.getScheduleStartDate())
                    .scheduleFinishdate(scheduleDTO.getScheduleFinishDate())
                    .build();
        }
    }
