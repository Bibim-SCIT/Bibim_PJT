package net.scit.backend.common;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 성공 확인 용 객체
 */
@Getter
@Setter
@Builder
public class SuccessDTO {
    private boolean success;
}
