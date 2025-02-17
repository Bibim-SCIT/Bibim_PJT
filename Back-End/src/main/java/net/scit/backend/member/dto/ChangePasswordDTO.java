package net.scit.backend.member.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordDTO {

    private String email;
    private String password;
    private String code;

}
