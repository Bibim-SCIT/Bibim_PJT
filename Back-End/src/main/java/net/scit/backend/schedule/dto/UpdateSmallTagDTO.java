package net.scit.backend.schedule.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSmallTagDTO {
    private Long mediumTagNumber;
    private Long smallTagNumber;
    private String tagName;
    private String newTagName;
}
