package net.scit.backend.chennel.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

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
    private Long massegeNumber;

    @ManyToOne
    @JoinColumn(name = "channel_number", nullable = false)
    private WorkspaceChannelEntity workspaceChannelEntity;
    
    private String sender;

    private String content;

    @CurrentTimestamp
    private LocalDateTime sendTime;


    private Boolean massegeOrFile;

}
