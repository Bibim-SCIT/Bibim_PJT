package net.scit.backend.workspace.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChannelUpdateRequest {
    private String channelName;
    private Long workspaceRole;
}
