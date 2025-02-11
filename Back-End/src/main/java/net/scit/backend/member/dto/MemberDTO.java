package net.scit.backend.member.dto;

import lombok.*;
import net.scit.backend.member.entity.MemberEntity;

import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDTO {

    private String email;
    private String password;
    private String name;
    private String nationality;
    private String language;
    private String profileImage;
    private boolean loginStatus;
    private String socialLoginCheck;
    private LocalDate regDate;
    private String roles;

    public static MemberDTO toDTO(MemberEntity memberEntity){
        return MemberDTO.builder()
                .email(memberEntity.getEmail())
                .password(memberEntity.getPassword())
                .name(memberEntity.getName())
                .nationality(memberEntity.getNationality())
                .language(memberEntity.getLanguage())
                .profileImage(memberEntity.getProfileImage())
                .loginStatus(memberEntity.isLoginStatus())
                .socialLoginCheck(memberEntity.getSocialLoginCheck())
                .regDate(memberEntity.getRegDate())
                .roles(memberEntity.getRoles())
                .build();
    }
}
