package net.scit.backend.schedule.dto;

import lombok.*;
import net.scit.backend.schedule.entity.LargeTagEntity;
import net.scit.backend.schedule.entity.MediumTagEntity;
import net.scit.backend.schedule.entity.SmallTagEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagListDTO {
    private Long wsId;
    private Long largeTagNumber;
    private String largeTagName;

    private Long mediumTagNumber;
    private String mediumTagName;

    private Long smallTagNumber;
    private String smallTagName;

    public static TagListDTO of(Long wsId, LargeTagEntity largeTag, MediumTagEntity mediumTag,
            SmallTagEntity smallTag) {
        return TagListDTO.builder()
                .wsId(wsId)
                .largeTagNumber(largeTag != null ? largeTag.getLargeTagNumber() : null)
                .largeTagName(largeTag != null ? largeTag.getTagName() : null)
                .mediumTagNumber(mediumTag != null ? mediumTag.getMediumTagNumber() : null)
                .mediumTagName(mediumTag != null ? mediumTag.getTagName() : null)
                .smallTagNumber(smallTag != null ? smallTag.getSmallTagNumber() : null)
                .smallTagName(smallTag != null ? smallTag.getTagName() : null)
                .build();
    }
}
