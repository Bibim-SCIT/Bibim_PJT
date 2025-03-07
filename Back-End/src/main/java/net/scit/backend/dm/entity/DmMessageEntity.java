package net.scit.backend.dm.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import org.hibernate.annotations.CurrentTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "dm")
public class DmMessageEntity 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dmNumber")
    private Long Id;

    private Long wsId; // ✅ 워크스페이스 ID
    private String sender;
    private String receiver;
    private String dmContent; // ✅ 메시지 내용 또는 파일 URL
    private String fileName; // ✅ 파일명 (파일일 경우 저장)
    private boolean isFile; // ✅ 파일 여부
    private boolean isRead; // ✅ 읽음 여부

    @CurrentTimestamp
    private LocalDateTime sendTime; // ✅ 메시지 전송 시간
}
