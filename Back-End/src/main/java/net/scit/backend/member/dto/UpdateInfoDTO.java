package net.scit.backend.member.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateInfoDTO {
    private String email;   //임시
    private String name;
    private String nationality;
    private String language;
}
