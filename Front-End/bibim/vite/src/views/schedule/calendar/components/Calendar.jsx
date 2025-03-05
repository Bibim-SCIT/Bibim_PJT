import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';
import styled from '@emotion/styled';
import useScheduleData from '../../../../hooks/useScheduleData';
import ScheduleDetailModal from '../../components/ScheduleDetailModal';
import ScheduleEditModal from '../../components/ScheduleEditModal';
import { useSelector } from 'react-redux';

const CalendarWrapper = styled(Box)({
  padding: '20px',
  '& .calendar-container': {
    padding: '20px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  },
  '& .fc': {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  '& .fc-toolbar': {
    display: 'flex !important',
    justifyContent: 'space-between !important',
    alignItems: 'center',
    marginBottom: '1.5em',
    padding: '0 1em',
  },
  '& .fc-toolbar-chunk': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:first-of-type': {
      visibility: 'hidden'
    },
    '&:nth-of-type(2)': {
      flex: '1',
      justifyContent: 'center'
    }
  },
  '& .fc-toolbar-title': {
    fontSize: '1.8em',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0'
  },
  '& .fc-button-group': {
    display: 'flex',
    gap: '5px',
    '& .fc-prev-button, & .fc-next-button': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#2c3e50',
      padding: '8px 12px',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      },
      '&::after': {
        fontSize: '1.2em',
        fontWeight: 'bold'
      }
    },
    '& .fc-prev-button::after': {
      content: '"<"'
    },
    '& .fc-next-button::after': {
      content: '">"'
    },
    '& .fc-prev-button span, & .fc-next-button span': {
      display: 'none'
    }
  },
  '& .fc-today-button': {
    backgroundColor: '#6B7280',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#4B5563'
    },
    '&:disabled': {
      backgroundColor: '#9CA3AF',
      opacity: 0.7
    }
  },
  '& .fc-event': {
    marginTop: '24px',
    zIndex: 1,
    borderRadius: '4px',
    padding: '2px 4px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  '& .schedule-highlight': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    filter: 'brightness(1.1)',
  },
  '& .fc-h-event': {
    background: 'none',
    '& .fc-event-main': {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.9em',
      fontWeight: '500'
    }
  },
  '& .fc-daygrid-day': {
    padding: '4px',
    '&:hover': {
      backgroundColor: '#F7FAFC',
    }
  },
  '& .fc-day-today': {
    backgroundColor: '#f8f9fa !important',
    '&:hover': {
      backgroundColor: '#f1f3f5 !important',
    }
  },
  '& .fc-day-today .fc-daygrid-day-number': {
    backgroundColor: 'transparent',
    color: '#2c3e50',
    fontWeight: '500',
  },
  '& .fc-daygrid-day-number': {
    padding: '4px 8px',
    color: '#2c3e50',
    fontSize: '14px',
  },
  '& .fc-daygrid-day:not(.fc-day-today) .fc-daygrid-day-number:hover': {
    backgroundColor: '#f3f4f6',
    cursor: 'pointer',
  },
  '& .fc-daygrid-day-frame': {
    padding: '2px',
    minHeight: '100px',
  },
  '& .fc-day-sun .fc-daygrid-day-number': {
    color: '#E53E3E',
  },
  '& .fc-day-sat .fc-daygrid-day-number': {
    color: '#3182CE',
  },
  '& .fc-daygrid-day-top': {
    position: 'absolute',
    zIndex: 2,
  },
  '& .fc-daygrid-day-events': {
    margin: '0',
    padding: '4px',
  },
});

const Calendar = () => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
  const { schedules: initialSchedules, loading, error, fetchSchedules } = useScheduleData();
  const [schedules, setSchedules] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  useEffect(() => {
    const wsId = activeWorkspace.wsId;
    fetchSchedules(wsId);
  }, [activeWorkspace]);

  const handleEventHover = (scheduleId, isHovering) => {
    const events = document.querySelectorAll(`[data-schedule-id="${scheduleId}"]`);
    events.forEach(event => {
      if (isHovering) {
        event.classList.add('schedule-highlight');
      } else {
        event.classList.remove('schedule-highlight');
      }
    });
  };

  const handleEventClick = (clickInfo) => {
    console.log('Clicked event data:', clickInfo.event);
    console.log('Event extendedProps:', clickInfo.event.extendedProps);
    setSelectedSchedule(clickInfo.event.extendedProps);
    setModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  const handleScheduleUpdate = async (updatedSchedule) => {
    if (updatedSchedule) {
      // 기존 스케줄 배열에서 업데이트된 스케줄을 찾아 교체
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule =>
          schedule.id === updatedSchedule.scheduleNumber
            ? {
              ...schedule,
              title: updatedSchedule.scheduleTitle,
              start: updatedSchedule.scheduleStartDate,
              end: updatedSchedule.scheduleFinishDate,
              extendedProps: updatedSchedule
            }
            : schedule
        )
      );

      // DetailModal에 표시되는 스케줄 정보도 업데이트
      setSelectedSchedule(updatedSchedule);
    }
  };

  if (loading) {
    return (
      <CalendarWrapper>
        <div className="calendar-container" style={{ textAlign: 'center', padding: '20px' }}>
          로딩 중...
        </div>
      </CalendarWrapper>
    );
  }

  if (error) {
    return (
      <CalendarWrapper>
        <div className="calendar-container" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          에러가 발생했습니다: {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
        </div>
      </CalendarWrapper>
    );
  }

  return (
    <CalendarWrapper>
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={schedules}
          headerToolbar={{
            left: '',
            center: 'title',
            right: 'prev,today,next'
          }}
          locale="ko"
          height="auto"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          titleFormat={{ year: 'numeric', month: 'long' }}
          buttonText={{
            today: 'Today',
            prev: '',
            next: ''
          }}
          eventClick={handleEventClick}
          eventDidMount={(info) => {
            const scheduleId = info.event.id;
            info.el.setAttribute('data-schedule-id', scheduleId);

            info.el.addEventListener('mouseenter', () => {
              handleEventHover(scheduleId, true);
            });

            info.el.addEventListener('mouseleave', () => {
              handleEventHover(scheduleId, false);
            });
          }}
          eventContent={(arg) => (
            <Box
              sx={{
                cursor: 'pointer',
                width: '100%',
                padding: '2px 4px'
              }}
            >
              {arg.event.title}
            </Box>
          )}
        />
        <ScheduleDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedSchedule(null);
          }}
          schedule={selectedSchedule}
          onUpdate={handleScheduleUpdate}
        />
        {isEditModalOpen && selectedEvent && (
          <ScheduleEditModal
            open={isEditModalOpen}
            onClose={handleEditModalClose}
            schedule={selectedEvent.extendedProps}
            onUpdate={handleScheduleUpdate}
          />
        )}
      </div>
    </CalendarWrapper>
  );
};

export default Calendar;