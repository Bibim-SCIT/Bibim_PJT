package net.scit.backend.schedule.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateLargeTagDTO {
    private Long wsId;
    private Long largeTagNumber;
    private String tagName;
    private String newTagName;
    private String newTagColor;
}
