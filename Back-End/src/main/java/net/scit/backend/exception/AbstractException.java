package net.scit.backend.exception;

import org.springframework.http.HttpStatus;

public abstract class AbstractException extends RuntimeException {

  abstract public HttpStatus getHttpStatus();
  abstract public ErrorCode getErrorCode();
  abstract public String getMessage();
}
