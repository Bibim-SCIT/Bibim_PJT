package net.scit.backend.schedule.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagListDTO {

    private List<LargeTagDTO> largeTags;
    private List<MediumTagDTO> mediumTags;
    private List<SmallTagDTO> smallTags;

    public static TagListDTO toDTO(List<LargeTagDTO> largeTagDTOList,
                                   List<MediumTagDTO> mediumTagDTOList, List<SmallTagDTO> smallTagDTOList) {
        return TagListDTO.builder()
                .largeTags(largeTagDTOList)
                .mediumTags(mediumTagDTOList)
                .smallTags(smallTagDTOList)
                .build();
    }
}
