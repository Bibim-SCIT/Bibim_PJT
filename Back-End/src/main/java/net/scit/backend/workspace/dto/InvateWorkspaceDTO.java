package net.scit.backend.workspace.dto;

import lombok.*;

/**
 * 새로운 워크스페이스를 받기 위한 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvateWorkspaceDTO 
{
    private Long wsID;
    private String code;
}
