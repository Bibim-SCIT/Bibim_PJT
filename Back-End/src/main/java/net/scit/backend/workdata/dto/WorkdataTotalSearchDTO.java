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
    private Long dataNumber;
    private String writer;
    private String title;
    private String content;
    private LocalDateTime regDate;
    private List<String> fileNames; // 기존 파일 이름 리스트
    private List<String> fileUrls;  // 추가된 파일 다운로드 URL 리스트
    private List<String> tags;

    public static WorkdataTotalSearchDTO toWorkdataTotalSearchDTO(WorkdataEntity entity) {
        return WorkdataTotalSearchDTO.builder()
                .dataNumber(entity.getDataNumber())
                .writer(entity.getWriter())
                .title(entity.getTitle())
                .content(entity.getContent())
                .regDate(entity.getRegDate())
                .fileNames(new ArrayList<>()) // 기본값 설정
                .fileUrls(new ArrayList<>())  // 기본값 설정
                .tags(new ArrayList<>()) // 기본값 설정
                .build();
    }
}
