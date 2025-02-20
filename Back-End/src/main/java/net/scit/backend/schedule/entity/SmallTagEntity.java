package net.scit.backend.schedule.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "small_tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmallTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long smallTagNumber;

    @ManyToOne
    @JoinColumn(name = "medium_tag_number")
    private MediumTagEntity mediumTag;

    private String tagName;
}
