package net.scit.backend.member.dto;

import lombok.*;

/**
 * 회원가입을 위해 사용자가 입력한 값을 받는 DTO
 */
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
    private boolean emailCheck;
}
