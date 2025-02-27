package net.scit.backend.workdata.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkdataEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkdataTotalSearchDTO {
    private String writer;
    private String title;
    private LocalDateTime regDate;
    private List<String> fileNames; // 파일 이름 리스트
    private List<String> tags; // 태그 리스트

    public static WorkdataTotalSearchDTO toWorkdataTotalSearchDTO(WorkdataEntity entity) {
        return WorkdataTotalSearchDTO.builder()
                .writer(entity.getWriter())
                .title(entity.getTitle())
                .regDate(entity.getRegDate())
                .fileNames(new ArrayList<>()) // 기본값 설정, 후에 추가
                .tags(new ArrayList<>()) // 기본값 설정, 후에 추가
                .build();
    }
}
