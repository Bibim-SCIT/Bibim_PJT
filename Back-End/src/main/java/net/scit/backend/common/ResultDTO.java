package net.scit.backend.common;

import lombok.Data;
import lombok.RequiredArgsConstructor;

/**
 * 결과확인용 객체
 */
@Data
@RequiredArgsConstructor(staticName = "of")
public class ResultDTO<T> {
    private final String message;
    private final T data;
}
