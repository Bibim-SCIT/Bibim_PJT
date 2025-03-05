package net.scit.backend.workdata.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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

    private Set<String> fileNames;
    private Set<String> fileUrls;
    private Set<String> tags;

    private Long mWsNumber;
    private String nickname;
    private String wsRole;
    private String profileImage;

    public static WorkdataDTO toDTO(WorkdataEntity entity,
                                    Set<WorkdataFileEntity> fileEntities,
                                    Set<WorkDataFileTagEntity> tagEntities,
                                    WorkspaceMemberEntity wsMember) {
        return WorkdataDTO.builder()
                .dataNumber(entity.getDataNumber())
                .title(entity.getTitle())
                .content(entity.getContent())
                .writer(entity.getWriter())
                .regDate(entity.getRegDate())
                .fileNames(fileEntities.stream()
                        .map(WorkdataFileEntity::getFileName)
                        .collect(Collectors.toSet())) // ✅ Set 변환
                .fileUrls(fileEntities.stream()
                        .map(WorkdataFileEntity::getFile)
                        .collect(Collectors.toSet())) // ✅ Set 변환
                .tags(tagEntities.stream()
                        .map(WorkDataFileTagEntity::getTag)
                        .collect(Collectors.toSet())) // ✅ Set 변환
                .mWsNumber(wsMember.getMWsNumber())
                .nickname(wsMember.getNickname())
                .wsRole(wsMember.getWsRole())
                .profileImage(wsMember.getProfileImage())
                .build();
    }
}
