package net.scit.backend.dm.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DmMessageDTO 
{
    private Long dmNumber;
    private Long wsId;
    private String sender;
    private String receiver;
    private String dmContent;
    private String fileName;
    private boolean isFile;
    private boolean isRead;
}
