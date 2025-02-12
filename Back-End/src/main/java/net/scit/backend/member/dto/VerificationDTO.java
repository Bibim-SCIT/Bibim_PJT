package net.scit.backend.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 이메일 인증을 위한 객체
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDTO {
    private String email;
    private String code;
}
