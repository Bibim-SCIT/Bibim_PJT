package net.scit.backend.mypage.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workdata.entity.WorkdataFileEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllWorkspaceDataDTO {

    private Long dataNumber;
    private Long workspaceNumber;
    private String workspaceName;
    private String writer;
    private String title;
    private String content;
    private LocalDateTime regDate;
    private List<String> fileNames;
    private List<String> fileUrls;
    private List<String> tags;
    private Long mWsNumber;
    private String nickname;
    private String profileImage;
    private String wsRole;

    public static AllWorkspaceDataDTO toDTO(WorkdataEntity workdataEntity) {
        return AllWorkspaceDataDTO.builder()
                .dataNumber(workdataEntity.getDataNumber())
                .workspaceNumber(workdataEntity.getWorkspace().getWsId())
                .workspaceName(workdataEntity.getWorkspace().getWsName())
                .writer(workdataEntity.getWriter())
                .title(workdataEntity.getTitle())
                .content(workdataEntity.getContent())
                .regDate(workdataEntity.getRegDate())
                .fileNames(workdataEntity.getWorkdataFiles().stream()
                        .map(WorkdataFileEntity::getFileName)
                        .distinct()
                        .collect(Collectors.toList()))
                .fileUrls(workdataEntity.getWorkdataFiles().stream()
                        .map(WorkdataFileEntity::getFile)
                        .distinct()
                        .collect(Collectors.toList()))
                .tags(workdataEntity.getWorkdataFileTags().stream()
                        .map(WorkDataFileTagEntity::getTag)
                        .distinct()
                        .collect(Collectors.toList()))
                .mWsNumber(workdataEntity.getWorkspaceMember().getMWsNumber())
                .nickname(workdataEntity.getWorkspaceMember().getNickname())
                .profileImage(workdataEntity.getWorkspaceMember().getProfileImage())
                .wsRole(workdataEntity.getWorkspaceMember().getWsRole())
                .build();
    }
}
