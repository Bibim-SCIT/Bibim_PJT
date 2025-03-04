package net.scit.backend.schedule.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMediumTagDTO {
    private Long largeTagNumber;
    private String tagName;
    private String newTagName;
}
