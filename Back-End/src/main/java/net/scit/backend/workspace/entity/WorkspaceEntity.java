package net.scit.backend.workspace.entity;

import java.time.LocalDateTime;
import java.util.*;

import jakarta.persistence.*;
import net.scit.backend.dm.entity.DmMessageEntity;
import net.scit.backend.schedule.entity.ScheduleEntity;
import net.scit.backend.workdata.entity.WorkDataFileTagEntity;
import net.scit.backend.workdata.entity.WorkdataEntity;
import org.hibernate.annotations.CurrentTimestamp;

import jakarta.annotation.Generated;
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

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkspaceChannelEntity> channels = new ArrayList<>();

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkspaceChannelRoleEntity> roles = new ArrayList<>();

//    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<DmMessageEntity> messages = new ArrayList<>();

    // WorkdataEntity와의 관계 설정 (OneToMany, mappedBy 수정)
//    @OneToMany(mappedBy = "workspaceEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<WorkdataEntity> workdata = new ArrayList<>();  // workdata가 연결될 workspace를 참조합니다.

    // @OneToMany(mappedBy = "workSpace", cascade = CascadeType.ALL, orphanRemoval = true)
    // private List<Record> records = new ArrayList<>();

//     @OneToMany(mappedBy = "workSpace", cascade = CascadeType.ALL, orphanRemoval = true)
//     private List<ScheduleEntity> scheduleEntity = new ArrayList<>();

    // @OneToMany(mappedBy = "workSpace", cascade = CascadeType.ALL, orphanRemoval = true)
    // private List<WorkData> workDataList = new ArrayList<>();


//    public static WorkspaceEntity toEntity (WorkspaceDTO workspaceDTO)
//    {
//        return WorkspaceEntity.builder()
//            .wsName(workspaceDTO.getWsName())
//            .wsImg("123")
//            .build();
//    }
}
