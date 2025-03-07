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

const Calendar = () => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadSchedules = async () => {
      if (!activeWorkspace?.wsId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await fetchKanbanTasks(activeWorkspace.wsId); // ✅ fetchKanbanTasks 사용
        console.log("📌 캘린더 데이터 로드 완료:", data);
        setSchedules(data);
      } catch (error) {
        console.error("❌ 캘린더 데이터 로드 실패:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [activeWorkspace]);

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

      setSelectedSchedule(updatedSchedule);
    }
  };

  if (loading) {
    return (
      <CalendarWrapper>
        <div className="calendar-container" style={{ textAlign: 'center', padding: '20px' }}>
          ⏳ 로딩 중...
        </div>
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
      </div>
    </CalendarWrapper>
  );
};

export default Calendar;
