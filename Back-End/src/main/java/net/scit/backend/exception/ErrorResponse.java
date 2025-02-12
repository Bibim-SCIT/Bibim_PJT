package net.scit.backend.exception;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
@Builder
public class ErrorResponse {

  private HttpStatus status;
  private ErrorCode errorCode;
  private String message;
}
