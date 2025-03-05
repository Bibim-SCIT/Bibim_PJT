package net.scit.backend.member.entity;

import com.nimbusds.openid.connect.sdk.assurance.evidences.Name;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import net.scit.backend.member.dto.MemberDTO;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.CurrentTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Member")
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
    private String socialLoginCheck;
    private String socialLoginId;

    @Column(name = "login_status")
    private boolean loginStatus;

    @Column(name = "last_active_time")
    @CreationTimestamp
    private LocalDateTime lastActiveTime; // 마지막 활동 시간 추가

    @CreationTimestamp
    private LocalDate regDate;

    @Builder.Default
    private String roles = "ROLE_USER";

    public static MemberEntity toEntity(MemberDTO memberDTO) {
        return MemberEntity.builder()
                .email(memberDTO.getEmail())
                .password(memberDTO.getPassword())
                .name(memberDTO.getName())
                .nationality(memberDTO.getNationality())
                .language(memberDTO.getLanguage())
                .profileImage(memberDTO.getProfileImage())
                .loginStatus(memberDTO.isLoginStatus())
                .socialLoginCheck(memberDTO.getSocialLoginCheck())
                .socialLoginId(memberDTO.getSocialLoginId())
                .build();
    }
}
