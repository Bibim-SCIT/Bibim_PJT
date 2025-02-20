package net.scit.backend.member.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateInfoResponseDTO {
    private boolean success;
    private String name;
    private String language;
    private String nationality;
    private String profileImage;
} 