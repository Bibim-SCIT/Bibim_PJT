package net.scit.backend.schedule.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medium_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediumTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mediumTagNumber;

    @ManyToOne
    @JoinColumn(name = "large_tag_number")
    private LargeTagEntity largeTag;

    private String tagName;
}
