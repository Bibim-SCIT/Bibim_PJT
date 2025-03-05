package net.scit.backend.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMemberDTO {
    private String name;           // 멤버 이름
    private String email;          // 멤버 이메일
    private String nickname;       // 워크스페이스 내 닉네임
    private String wsRole;         // 워크스페이스 내 역할
    private String profileImage;   // 프로필 이미지 URL
    private LocalDateTime lastActiveTime; // 마지막 활동 시간
}
