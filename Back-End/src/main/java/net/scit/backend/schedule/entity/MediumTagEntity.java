package net.scit.backend.schedule.entity;

import jakarta.persistence.*;
import lombok.*;
import net.scit.backend.schedule.dto.MediumTagDTO;

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

    public static MediumTagEntity toEntity(MediumTagDTO mediumTagDTO,
            LargeTagEntity largeTag) {
        return MediumTagEntity.builder()
                .largeTag(largeTag)
                .tagName(mediumTagDTO.getTagName())
                .build();
    }
}
