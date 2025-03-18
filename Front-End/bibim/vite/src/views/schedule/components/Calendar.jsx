import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Avatar } from '@mui/material';
import styled from '@emotion/styled';
import ScheduleDetailModal from './ScheduleDetailModal';
import ScheduleEditModal from './ScheduleEditModal';

// const CalendarWrapper = styled(Box)({
//   padding: '20px',
//   '& .calendar-container': {
//     padding: '20px',
//     background: '#fff',
//     borderRadius: '10px',
//     boxShadow: '0 0 10px rgba(0,0,0,0.1)'
//   },
//   '& .fc': {
//     maxWidth: '1200px',
//     margin: '0 auto'
//   },
// });

const Calendar = ({ tasks, onDeleteSuccess }) => {
  const [schedules, setSchedules] = useState(tasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoveredSchedule, setHoveredSchedule] = useState(null); // Hover 중인 스케줄 ID 저장

  // ✅ 새로운 일정이 추가될 때 스케줄 상태 업데이트
  const handleScheduleAdded = (newSchedule) => {
    setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
  };

  // ✅ tasks가 변경될 때마다 일정 상태 업데이트
  useEffect(() => {
    setSchedules(tasks);
  }, [tasks]);

  // ✅ 스케줄 삭제 시 전체 데이터 다시 불러오기
  const handleScheduleDeleted = () => {
    if (onDeleteSuccess) {
      onDeleteSuccess(); // 부모 컴포넌트(SchedulePage)에서 전체 일정 다시 불러오기
    }
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

  console.log("현재 선택 달력 스케줄", selectedSchedule);

  return (
    <Box
      sx={{
        padding: 2,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: '10px',
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
          eventClick={(clickInfo) => {
            setSelectedSchedule(clickInfo.event.extendedProps);
            setModalOpen(true);
          }}
          eventDidMount={(info) => {
            const scheduleId = info.event.id;
            info.el.setAttribute('data-schedule-id', scheduleId);

            // ✅ extendedProps에 color 값이 있으면 해당 색상 적용
            const eventColor = info.event.extendedProps.color || '#3788d8'; // 기본값: 파란색
            info.el.style.backgroundColor = eventColor;
            info.el.style.borderColor = eventColor; // 테두리 색상도 동일하게 설정
            info.el.style.color = 'white'; // 텍스트 가독성을 위해 흰색으로 설정

            info.el.addEventListener('mouseenter', () => handleEventHover(scheduleId, true));
            info.el.addEventListener('mouseleave', () => handleEventHover(scheduleId, false));
          }}
          // eventContent={(arg) => (
          //   <Box
          //     sx={{
          //       '& .fc-daygrid-event-harness': {
          //         display: 'flex',
          //         flexDirection: 'column',
          //         gap: '4px', // ✅ 이벤트 간 간격 확보 (margin 없이!)
          //       },
          //       '& .fc-daygrid-event': {
          //         padding: '4px', // ✅ 내부 간격 조정 (이벤트 높이 변화 없음)
          //         borderRadius: '5px', // ✅ 둥근 테두리
          //         fontSize: '13px', // ✅ 폰트 크기 조정
          //       },
          //       '& .fc-event-title': {
          //         lineHeight: '1.2', // ✅ 글자 높이 조정
          //       },
          //     }}
          //   >

          //     {arg.event.title}
          //   </Box>
          // )}
          /** ✅ 일정 내부 텍스트 및 프로필 이미지 추가 */
          eventContent={(arg) => {
            const { scheduleStatus, profileImage } = arg.event.extendedProps;

            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px', // ✅ 텍스트와 이미지 사이 간격
                  backgroundColor: arg.event.extendedProps.color || '#3788d8',
                  color: 'white',
                  borderRadius: '5px',
                  padding: '2px 6px',
                  fontSize: '13px',
                  lineHeight: '1.2',
                }}
              >
                {/* ✅ 일정 제목 */}
                <span>{arg.event.title}</span>

                {/* ✅ UNASSIGNED가 아닐 경우 프로필 이미지 표시 */}
                {scheduleStatus !== 'UNASSIGNED' && (
                  <Avatar
                    src={profileImage || ''}
                    sx={{
                      width: 14, // 🔹 엄청 작은 크기
                      height: 14,
                      border: '1px solid white',
                      backgroundColor: profileImage ? 'transparent' : 'gray', // 이미지가 없을 경우 기본 회색 원형
                    }}
                  />
                )}
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
          onDeleteSuccess={handleScheduleDeleted} // ✅ 삭제 후 전체 일정 다시 불러오기
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
