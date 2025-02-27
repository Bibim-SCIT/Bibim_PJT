package net.scit.backend.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMemberDTO {
    private String nickname;        // WorkspaceMemberEntity에서
    private String profileImage;    // WorkspaceMemberEntity에서
    private String name;           // MemberEntity에서
} 