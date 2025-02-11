package net.scit.backend.member.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import net.scit.backend.member.dto.MemberDTO;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.CurrentTimestamp;

import java.time.LocalDate;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberEntity {

    @Id
    private String email;
    private String password;
    private String name;
    private String nationality;
    private String language;
    private String profileImage;
    private boolean loginStatus;
    private String socialLoginCheck;

    @CreationTimestamp
    private LocalDate regDate;

    @Builder.Default
    private String roles = "ROLE_USER";

    public static MemberEntity toEntity(MemberDTO memberDTO){
        return MemberEntity.builder()
                .email(memberDTO.getEmail())
                .password(memberDTO.getPassword())
                .name(memberDTO.getName())
                .nationality(memberDTO.getNationality())
                .language(memberDTO.getLanguage())
                .profileImage(memberDTO.getProfileImage())
                .loginStatus(memberDTO.isLoginStatus())
                .socialLoginCheck(memberDTO.getSocialLoginCheck())
                .build();
    }
}
