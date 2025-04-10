package net.scit.backend.workdata.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
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
public class WorkdataTotalSearchDTO {
    private Long dataNumber;
    private String writer;
    private String title;
    private String content;
    private LocalDateTime regDate;
    private List<String> fileNames;
    private List<String> fileUrls;
    private List<String> tags;

    private Long mWsNumber;
    private String nickname;
    private String wsRole;
    private String profileImage;

    public static WorkdataTotalSearchDTO toDTO(WorkdataEntity entity, List<WorkdataFileEntity> fileEntities, List<WorkDataFileTagEntity> tagEntities, WorkspaceMemberEntity wsMember) {
        return WorkdataTotalSearchDTO.builder()
                .dataNumber(entity.getDataNumber())
                .writer(entity.getWriter())
                .title(entity.getTitle())
                .content(entity.getContent())
                .regDate(entity.getRegDate())
                .fileNames(fileEntities.stream()
                        .map(WorkdataFileEntity::getFileName)
                        .distinct()
                        .collect(Collectors.toList()))
                .fileUrls(fileEntities.stream()
                        .map(WorkdataFileEntity::getFile)
                        .distinct()
                        .collect(Collectors.toList()))
                .tags(tagEntities.stream()
                        .map(WorkDataFileTagEntity::getTag)
                        .distinct()
                        .collect(Collectors.toList()))
                .mWsNumber(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getMWsNumber).orElse(null))
                .nickname(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getNickname).orElse(null))
                .wsRole(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getWsRole).orElse(null))
                .profileImage(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getProfileImage).orElse(null))
                .build();
    }
}