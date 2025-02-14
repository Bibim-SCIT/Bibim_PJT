package net.scit.backend.workspace.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.scit.backend.workspace.dto.WorkspaceDTO;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "workspace")
public class WorkspaceEntity 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long wsId;
    
    private String wsName;
    private String wsImg;

    @CurrentTimestamp
    private LocalDateTime regDate;

    public static WorkspaceEntity toEntity (WorkspaceDTO workspaceDTO)
    {
        return WorkspaceEntity.builder()
            .wsName(workspaceDTO.getWsName())
            .wsImg("123")
            .build();
    }
}
