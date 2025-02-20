package net.scit.backend.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.scit.backend.workspace.entity.WorkspaceEntity;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WorkspaceDTO 
{
    private Long wsId;
    private String wsName;
    private String wsImg;

    public static WorkspaceDTO toDTO (WorkspaceEntity workspaceEntity)
    {
        return WorkspaceDTO.builder()
                .wsId(workspaceEntity.getWsId())
                .wsName(workspaceEntity.getWsName())
                .wsImg(workspaceEntity.getWsImg())
                .build();
    }
}
