package net.scit.backend.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class MemberLoginStatusDTO {

    private String email;
    private boolean loginStatus;
    private LocalDateTime lastActiveTime;
}
