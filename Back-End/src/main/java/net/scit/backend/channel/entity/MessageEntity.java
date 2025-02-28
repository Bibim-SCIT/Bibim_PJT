package net.scit.backend.channel.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import org.hibernate.annotations.CurrentTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.scit.backend.workspace.entity.WorkspaceChannelEntity;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "workspace_channel_message")
@Builder
public class MessageEntity 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageNumber;

    @ManyToOne
    @JoinColumn(name = "channel_number", nullable = false)
    private WorkspaceChannelEntity workspaceChannelEntity;

    //db 수정에 따른 외래키 에러로 컬럼 길이 명시
    @Column(length=50)
    private String sender;

    private String content;

    @CurrentTimestamp
    private LocalDateTime sendTime;

    private Boolean messageOrFile;

}
