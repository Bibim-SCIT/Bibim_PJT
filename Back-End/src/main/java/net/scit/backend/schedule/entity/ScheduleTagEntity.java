package net.scit.backend.schedule.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "schedule_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class ScheduleTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleTagNumber;

    @ManyToOne
    @JoinColumn(name = "schedule_number")
    private ScheduleEntity schedule;

    @ManyToOne
    @JoinColumn(name = "large_tag_number")
    private LargeTagEntity largeTag;

    @ManyToOne
    @JoinColumn(name = "medium_tag_number")
    private MediumTagEntity mediumTag;

    @ManyToOne
    @JoinColumn(name = "small_tag_number")
    private SmallTagEntity smallTag;
}
