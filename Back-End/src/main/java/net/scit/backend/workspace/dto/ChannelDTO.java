package net.scit.backend.workspace.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChannelDTO
{
    private Long channelId;
    private String channelName;
}
