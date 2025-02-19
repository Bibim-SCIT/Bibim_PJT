package net.scit.backend.schedule.type;

import lombok.Getter;
import net.scit.backend.exception.CustomException;
import net.scit.backend.exception.ErrorCode;

@Getter
public enum ScheduleStatus {
    UNASSIGNED('1', "미배정"),
    IN_PROGRESS('2', "진행 중"),
    COMPLETED('3', "완료"),
    ON_HOLD('4', "보류");

    private final char code;
    private final String description;

    ScheduleStatus(char code, String description) {
        this.code = code;
        this.description = description;
    }

    public static ScheduleStatus fromCode(char code) {
        for (ScheduleStatus status : ScheduleStatus.values()) {
            if (status.getCode() == code) {
                return status;
            }
        }
        throw new CustomException(ErrorCode.INVALID_SCHEDULE_STATUS);
    }
}
