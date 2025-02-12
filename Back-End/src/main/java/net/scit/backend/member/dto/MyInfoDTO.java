package net.scit.backend.member.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class MyInfoDTO {
    private final boolean success;
    private final String email;
    private final String name;
    private final String nationality;
    private final String language;
    private final String profileImage;
    private final String socialLoginCheck;
    private final LocalDate regDate;

}
