package net.scit.backend.channel.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
    

    @Column(length = 50) // 최대 길이 100으로 설정
    private String sender;
    

    private String content;

    @CurrentTimestamp
    private LocalDateTime sendTime;

    @Builder.Default
    private Boolean messageOrFile = false;

    private String fileName;


}
