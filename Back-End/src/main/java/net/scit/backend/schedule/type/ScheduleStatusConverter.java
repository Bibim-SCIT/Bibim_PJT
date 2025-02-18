package net.scit.backend.schedule.type;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ScheduleStatusConverter implements AttributeConverter<ScheduleStatus, Character> {

    @Override
    public Character convertToDatabaseColumn(ScheduleStatus status) {
        return (status != null) ? status.getCode() : null;
    }

    @Override
    public ScheduleStatus convertToEntityAttribute(Character dbData) {
        return (dbData != null) ? ScheduleStatus.fromCode(dbData) : null;
    }
}
