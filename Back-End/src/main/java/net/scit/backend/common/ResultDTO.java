package net.scit.backend.common;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor(staticName = "of")
public class ResultDTO<T> {
    private final String message;
    private final T data;
}
