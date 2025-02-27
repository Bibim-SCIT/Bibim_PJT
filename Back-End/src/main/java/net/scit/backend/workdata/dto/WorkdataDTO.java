package net.scit.backend.workdata.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkdataDTO {

    private Long dataNumber;
    private String title;
    private String content;
    private String writer;
    private LocalDateTime regDate;

    // 게시물 생성 시 파일 주소 및 파일 이름을 받아오기 위해 새로 추가
    private List<String> fileNames;
    private List<String> fileUrls;

    // WorkspaceMemberEntity 관련 필드 추가
    private Long mWsNumber;
    private String nickname;
    private String wsRole;
    private String profileImage;


    // WorkdataEntity만 변환할 때 사용
    public static WorkdataDTO toDTO(WorkdataEntity workdata) {
        return toDTO(workdata, null);
    }

    // WorkdataEntity와 WorkspaceMemberEntity를 함께 변환할 때 사용
    public static WorkdataDTO toDTO(WorkdataEntity workdata, WorkspaceMemberEntity wsMember) {
        return WorkdataDTO.builder()
                .dataNumber(workdata.getDataNumber())
                .title(workdata.getTitle())
                .content(workdata.getContent())
                .writer(workdata.getWriter())
                .regDate(workdata.getRegDate())
                .fileNames(workdata.getWorkdataFile().stream()
                        .map(WorkdataFileEntity::getFileName)
                        .distinct()
                        .collect(Collectors.toList()))
                .fileUrls(workdata.getWorkdataFile().stream()
                        .map(WorkdataFileEntity::getFile)
                        .distinct()
                        .collect(Collectors.toList()))
                .mWsNumber(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getMWsNumber).orElse(null))
                .nickname(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getNickname).orElse(null))
                .wsRole(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getWsRole).orElse(null))
                .profileImage(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getProfileImage).orElse(null))
                .build();
    }
}
