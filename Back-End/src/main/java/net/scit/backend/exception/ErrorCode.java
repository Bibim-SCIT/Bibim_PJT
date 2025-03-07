package net.scit.backend.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // Member
    EMAIL_DUPLICATE("이미 가입한 이메일 입니다.", HttpStatus.BAD_REQUEST),
    MEMBER_NOT_FOUND("해당하는 회원이 존재하지 않습니다.", HttpStatus.NOT_FOUND),
    INVALID_PASSWORD("비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED),
    MEMBER_HAVE_NOT_ROLE("해당 권한이 존재하지 않습니다.", HttpStatus.FORBIDDEN),
    OAUTH_ALREADY_LINKED("이미 연동을 진행한 회원입니다.", HttpStatus.CONFLICT),
    EMAIL_NOT_EQUAL("이메일이 일치하지 않습니다.", HttpStatus.BAD_REQUEST),
    INVALID_ROLE_VALUE("잘못된 역할 입니다.", HttpStatus.BAD_REQUEST),

    // WorkSpace
    WORKSPACE_NOT_FOUND("해당 워크스페이스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    WORKSPACE_MEMBER_NOT_FOUND("해당 워크스페이스의 멤버가 아닙니다.", HttpStatus.FORBIDDEN),
    WORKSPACE_MEMBER_NOT_HAVE_ROLE("해당 권한이 없습니다.", HttpStatus.FORBIDDEN),
    UNAUTHORIZED("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED("이 작업을 수행할 권한이 없습니다.", HttpStatus.FORBIDDEN),

    // Schedule
    INVALID_SCHEDULE_STATUS("알 수 없는 일정 상태 입니다.", HttpStatus.BAD_REQUEST),
    SCHEDULE_NOT_FOUND("해당 스케줄을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INVALID_SCHEDULE_MEMBER("해당 스케줄의 담당자가 아닙니다.", HttpStatus.FORBIDDEN),

    // Tag
    TAG_NOT_FOUND("해당 태그를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INVALID_TAG_HIERARCHY("잘못된 태그 계층 구조 입니다.", HttpStatus.BAD_REQUEST),
    TAG_DUPLICATE("이미 생성한 태그입니다.", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("잘못된 요청입니다.", HttpStatus.BAD_REQUEST),

    // Common
    PARSING_ERROR("파싱 오류가 발생했습니다.", HttpStatus.BAD_REQUEST),
    FAILED_IMAGE_SAVE("이미지 저장에 실패 했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    UN_SUPPORTED_IMAGE_TYPE("지원되지 않는 이미지 파일 형식입니다.", HttpStatus.BAD_REQUEST),
    IMAGE_IO_ERROR("파일이 없거나 접근할 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    IMAGE_ACCESS_DENIED("권한이 없어 접근이 불가능한 이미지입니다.", HttpStatus.FORBIDDEN),
    IMAGE_NOT_HAVE_PATH("잘못된 이미지 파일 경로입니다.", HttpStatus.BAD_REQUEST),
    IMAGE_EXCEPTION("이미지 관련 에러입니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    IMAGE_INTERNAL_SERVER_ERROR("이미지 내부 서버 오류입니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    IMAGE_MALFORMED("잘못된 형식의 URL입니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    IMAGE_NOT_FOUND("이미지가 존재하지 않습니다.", HttpStatus.NOT_FOUND),
    SEND_MAIL_FAIL("메일전송에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_NOT_VERIFIED("이메일 인증이 완료되지 않았습니다.", HttpStatus.UNAUTHORIZED),
    INVALID_EMAIL_CODE("인증 코드가 잘못되었습니다.", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN("잘못된 토큰 입니다.", HttpStatus.UNAUTHORIZED),

    // Redis 관련 예외 추가
    REDIS_CONNECTION_FAILED("Redis 서버에 연결할 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    //Workspace Channel
    CHANNEL_NOT_FOUND("해당 채널을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    CHANNEL_ALREADY_EXISTS("같은 이름 채널이 존재합니다.", HttpStatus.NOT_FOUND),
    CHANNEL_DELETE_FORBIDDEN("채널 삭제 권한이 없습니다.", HttpStatus.FORBIDDEN),
    CHANNEL_UPDATE_FORBIDDEN("채널 수정 권한이 없습니다.", HttpStatus.FORBIDDEN ),
    ROLE_NOT_FOUND("해당 역할을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);


    String message;
    HttpStatus status;

    ErrorCode(String message, HttpStatus httpStatus) {
        this.message = message;
        this.status = httpStatus;
    }
}
