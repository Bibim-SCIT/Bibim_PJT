package net.scit.backend.workdata.dto;

import lombok.*;
import net.scit.backend.workdata.entity.WorkdataEntity;
import net.scit.backend.workspace.entity.WorkspaceMemberEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    // 🔹 추가: WorkspaceMemberEntity 관련 필드
    private Long mWsNumber;
    private String nickname;
    private String wsRole;
    private String profileImage;

    public static WorkdataTotalSearchDTO toWorkdataTotalSearchDTO(WorkdataEntity entity, WorkspaceMemberEntity wsMember) {
        return WorkdataTotalSearchDTO.builder()
                .dataNumber(entity.getDataNumber())
                .writer(entity.getWriter())
                .title(entity.getTitle())
                .content(entity.getContent())
                .regDate(entity.getRegDate())
                .fileNames(new ArrayList<>()) // 기본값 설정
                .fileUrls(new ArrayList<>())  // 기본값 설정
                .tags(new ArrayList<>()) // 기본값 설정
                .mWsNumber(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getMWsNumber).orElse(null))
                .nickname(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getNickname).orElse(null))
                .wsRole(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getWsRole).orElse(null))
                .profileImage(Optional.ofNullable(wsMember).map(WorkspaceMemberEntity::getProfileImage).orElse(null))
                .build();
    }
}

