package net.scit.backend.schedule.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import net.scit.backend.schedule.entity.MediumTagEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediumTagDTO {

    private Long largeTagNumber;
    private Long mediumTagNumber;
    private String tagName;

    public static MediumTagDTO toDTO(MediumTagEntity mediumTagEntity) {
        return MediumTagDTO.builder()
                .largeTagNumber(mediumTagEntity.getLargeTag().getLargeTagNumber())
                .mediumTagNumber(mediumTagEntity.getMediumTagNumber())
                .tagName(mediumTagEntity.getTagName())
                .build();
    }
}
