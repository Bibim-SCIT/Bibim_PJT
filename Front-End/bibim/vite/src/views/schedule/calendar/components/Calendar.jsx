import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';
import styled from '@emotion/styled';
import ScheduleDetailModal from '../../components/ScheduleDetailModal';
import ScheduleEditModal from '../../components/ScheduleEditModal';
import { useSelector } from 'react-redux';
import { fetchKanbanTasks } from '../../../../api/schedule'; // ✅ fetchKanbanTasks로 변경
import ScheduleLoading from './ScheduleLoading';

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
});

const Calendar = ({ wsId }) => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoveredSchedule, setHoveredSchedule] = useState(null); // Hover 중인 스케줄 ID 저장

  // ✅ 일정 데이터 불러오기
  const loadSchedules = async () => {
    if (!activeWorkspace?.wsId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchKanbanTasks(activeWorkspace.wsId);
      console.log("📌 캘린더 데이터 로드 완료:", data);
      setSchedules(data);
    } catch (error) {
      console.error("❌ 캘린더 데이터 로드 실패:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useEffect를 활용한 일정 자동 업데이트
  useEffect(() => {
    loadSchedules();
  }, [activeWorkspace]); // 워크스페이스 변경될 때마다 일정 불러오기

  // ✅ 새로운 일정이 추가될 때 스케줄 상태 업데이트
  const handleScheduleAdded = (newSchedule) => {
    setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
  };


  const handleEventHover = (scheduleId, isHovering) => {
    const events = document.querySelectorAll(`[data-schedule-id="${scheduleId}"]`);
    events.forEach(event => {
      event.classList.toggle('schedule-highlight', isHovering);
    });
  };

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
        prevSchedules.map(schedule =>
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
    return (
      <CalendarWrapper>
        <ScheduleLoading />
      </CalendarWrapper>
    );
  }

  if (error) {
    return (
      <CalendarWrapper>
        <div className="calendar-container" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          ⚠️ 에러 발생: {error instanceof Error ? error.message : '알 수 없는 오류'}
        </div>
      </CalendarWrapper>
    );
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
          color: '#FFFFFF',
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
          backgroundColor: '#F8F9FA !important',
          '&:hover': {
            backgroundColor: '#F1F3F5 !important',
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
          // eventClick={handleEventClick}
          eventClick={(clickInfo) => {
            setSelectedSchedule(clickInfo.event.extendedProps);
            setModalOpen(true);
          }}
          eventDidMount={(info) => {
            const scheduleId = info.event.id;
            info.el.setAttribute('data-schedule-id', scheduleId);

            info.el.addEventListener('mouseenter', () => handleEventHover(scheduleId, true));
            info.el.addEventListener('mouseleave', () => handleEventHover(scheduleId, false));
          }}
          eventContent={(arg) => (
            <Box sx={{ cursor: 'pointer', width: '100%', padding: '2px 4px' }}>
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
      </Box>
    </Box>
  );
};
export default Calendar;

