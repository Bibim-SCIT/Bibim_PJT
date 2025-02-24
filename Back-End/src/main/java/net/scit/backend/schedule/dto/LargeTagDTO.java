package net.scit.backend.schedule.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import net.scit.backend.schedule.entity.LargeTagEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LargeTagDTO {

    private Long wsId;
    private String tagName;
    private String tagColor;

    public static LargeTagDTO toDTO(LargeTagEntity largeTagEntity) {
        return LargeTagDTO.builder()
                .wsId(largeTagEntity.getWorkspace().getWsId())
                .tagName(largeTagEntity.getTagName())
                .tagColor(largeTagEntity.getTagColor())
                .build();
    }
}
