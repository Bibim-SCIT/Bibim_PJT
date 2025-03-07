import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';
import useScheduleData from '../../../../hooks/useScheduleData';
import ScheduleDetailModal from '../../components/ScheduleDetailModal';
import ScheduleEditModal from '../../components/ScheduleEditModal';
import { useSelector } from 'react-redux';

const Calendar = () => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
  const { schedules: initialSchedules, loading, error, fetchSchedules } = useScheduleData();
  const [schedules, setSchedules] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoveredSchedule, setHoveredSchedule] = useState(null); // Hover 중인 스케줄 ID 저장

  useEffect(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  useEffect(() => {
    fetchSchedules(activeWorkspace.wsId);
  }, [activeWorkspace]);

  const handleEventClick = (clickInfo) => {
    setSelectedSchedule(clickInfo.event.extendedProps);
    setModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  const handleScheduleUpdate = async (updatedSchedule) => {
    if (updatedSchedule) {
      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) =>
          schedule.id === updatedSchedule.scheduleNumber
            ? { ...schedule, ...updatedSchedule, extendedProps: updatedSchedule }
            : schedule
        )
      );
      setSelectedSchedule(updatedSchedule);
    }
  };

  const handleEventMouseEnter = (hoverInfo) => {
    setHoveredSchedule(hoverInfo.event.extendedProps.scheduleNumber); // 같은 스케줄 ID 저장
  };

  const handleEventMouseLeave = () => {
    setHoveredSchedule(null); // 초기화
  };

  if (loading) {
    return <Box sx={{ textAlign: 'center', padding: 2 }}>로딩 중...</Box>;
  }

  if (error) {
    return <Box sx={{ textAlign: 'center', padding: 2, color: 'red' }}>에러가 발생했습니다: {error.message || '알 수 없는 오류'}</Box>;
  }

  return (
    <Box
      sx={{
        padding: 2,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        '& .calendar-container': {
          padding: 2,
          background: '#fff',
          borderRadius: 2,
          boxShadow: 1,
        },
        '& .fc-toolbar': {
          display: 'flex !important',
          justifyContent: 'space-between !important',
          alignItems: 'center',
          marginBottom: 3,
          padding: '0 1em',
        },
        '& .fc-today-button': {
          backgroundColor: '#6B7280',
          color: '#ffffff',
          borderRadius: 1,
          '&:hover': {
            backgroundColor: '#4B5563',
          },
        },
        '& .fc-event': {
          borderRadius: 1,
          padding: '2px 4px',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
        },
        '& .fc-day-today': {
          backgroundColor: '#f8f9fa !important',
          '&:hover': {
            backgroundColor: '#f1f3f5 !important',
          },
        },
        '& .fc-daygrid-day-number': {
          padding: '4px 8px',
          fontSize: '14px',
        },
      }}
    >
      <Box className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={schedules}
          headerToolbar={{ left: '', center: 'title', right: 'prev,today,next' }}
          locale="ko"
          height="auto"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          titleFormat={{ year: 'numeric', month: 'long' }}
          buttonText={{ today: 'Today', prev: '', next: '' }}
          eventClick={handleEventClick}
          eventMouseEnter={handleEventMouseEnter} // Hover 시작
          eventMouseLeave={handleEventMouseLeave} // Hover 종료
          eventContent={(arg) => {
            const isHovered = hoveredSchedule === arg.event.extendedProps.scheduleNumber;
            return (
              <Box
                sx={{
                  cursor: 'pointer',
                  padding: '2px 4px',
                  transition: 'all 0.2s ease-in-out',
                  transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isHovered ? '4px 4px 10px rgba(0, 0, 0, 0.2)' : 'none',
                  borderRadius: 1,
                  backgroundColor: schedules.color,
                }}
              >
                {arg.event.title}
              </Box>
            );
          }}
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
      </Box>
    </Box>
  );
};

export default Calendar;
