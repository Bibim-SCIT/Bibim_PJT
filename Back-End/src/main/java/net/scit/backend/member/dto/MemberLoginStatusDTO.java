package net.scit.backend.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MemberLoginStatusDTO {
    private String email;
    private boolean loginStatus;
}
