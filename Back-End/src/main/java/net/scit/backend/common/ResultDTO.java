package net.scit.backend.common;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

/**
 * 결과확인용 객체
 */
@Data
@RequiredArgsConstructor(staticName = "of")
@Builder
public class ResultDTO<T> {
    private final String message;
    private final T data;
}
