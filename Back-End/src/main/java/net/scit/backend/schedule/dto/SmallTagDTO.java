package net.scit.backend.schedule.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import net.scit.backend.schedule.entity.SmallTagEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmallTagDTO {

    private Long mediumTagNumber;
    private String tagName;

    public static SmallTagDTO toDTO(SmallTagEntity smallTagEntity) {
        return SmallTagDTO.builder()
                .mediumTagNumber(smallTagEntity.getMediumTag().getMediumTagNumber())
                .tagName(smallTagEntity.getTagName())
                .build();
    }
}
