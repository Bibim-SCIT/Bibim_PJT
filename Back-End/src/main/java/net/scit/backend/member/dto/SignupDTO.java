package net.scit.backend.member.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupDTO {
    private String email;
    private String password;
    private String name;
    private String nationality;
    private String language;
    private String profileImage;
    private boolean emailCheck;
}
