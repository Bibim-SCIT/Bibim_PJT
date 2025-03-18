import React, { useState } from 'react';
import { Box, Paper, Avatar } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import MyScheduleDetailModal from './MyScheduleDetailModal';

const MyCalendar = ({ scheduleData, onEventClick, onDeleteSuccess }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // 빈 데이터 체크
  const isEmpty = !scheduleData || scheduleData.length === 0;

  // 이벤트 호버 핸들러
  const handleEventHover = (scheduleId, isHovering) => {
    const events = document.querySelectorAll(`[data-schedule-id="${scheduleId}"]`);
    events.forEach(event => {
      event.classList.toggle('schedule-highlight', isHovering);
    });
  };
  
  // 이벤트 클릭 핸들러
  const handleEventClick = (clickInfo) => {
    setSelectedSchedule(clickInfo.event.extendedProps);
    setModalOpen(true);
    
    // 상위 컴포넌트에 클릭 이벤트를 전달
    if (onEventClick) {
      onEventClick(clickInfo);
    }
  };
  
  // 일정 업데이트 핸들러
  const handleScheduleUpdate = (updatedSchedule) => {
    if (updatedSchedule) {
      // 모달의 데이터를 업데이트
      setSelectedSchedule(updatedSchedule);
    }
  };
  
  // 일정 삭제 성공 핸들러
  const handleDeleteSuccess = () => {
    // 모달 닫기
    setModalOpen(false);
    setSelectedSchedule(null);
    
    // 상위 컴포넌트에 삭제 성공 알림
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        width: '100%',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 3px 10px rgba(0,0,0,0.03), 0 1px 5px rgba(0,0,0,0.02)'
        }
      }}
    >
      <Box
        sx={{
          padding: 2,
          '& .fc': {
            width: '100%',
          },
          '& .fc-toolbar': {
            display: 'flex !important',
            justifyContent: 'space-between !important',
            alignItems: 'center',
            marginBottom: 2,
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
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={scheduleData}
          headerToolbar={{ left: '', center: 'title', right: 'prev,today,next' }}
          locale="ko"
          height="auto"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          titleFormat={{ year: 'numeric', month: 'long' }}
          buttonText={{ today: 'Today', prev: '', next: '' }}
          eventClick={handleEventClick}
          eventDidMount={(info) => {
            const scheduleId = info.event.id;
            info.el.setAttribute('data-schedule-id', scheduleId);
            
            // 이벤트 색상 적용
            const eventColor = info.event.extendedProps.color || '#3788d8';
            info.el.style.backgroundColor = eventColor;
            info.el.style.borderColor = eventColor;
            info.el.style.color = 'white';

            info.el.addEventListener('mouseenter', () => handleEventHover(scheduleId, true));
            info.el.addEventListener('mouseleave', () => handleEventHover(scheduleId, false));
          }}
          eventContent={(arg) => {
            const { scheduleStatus, profileImage } = arg.event.extendedProps;
            
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: arg.event.extendedProps.color || '#3788d8',
                  color: 'white',
                  borderRadius: '5px',
                  padding: '2px 6px',
                  fontSize: '13px',
                  lineHeight: '1.2',
                }}
              >
                {/* 일정 제목 */}
                <span>{arg.event.title}</span>
                
                {/* 워크스페이스 정보 */}
                {arg.event.extendedProps.wsName && (
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>
                    [{arg.event.extendedProps.wsName}]
                  </span>
                )}

                {/* 담당자 프로필 이미지 */}
                {scheduleStatus !== 'UNASSIGNED' && profileImage && (
                  <Avatar
                    src={profileImage || ''}
                    sx={{
                      width: 14,
                      height: 14,
                      border: '1px solid white',
                      backgroundColor: profileImage ? 'transparent' : 'gray',
                    }}
                  />
                )}
              </Box>
            );
          }}
        />
      </Box>
      
      {/* 일정 상세 모달 */}
      <MyScheduleDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onUpdate={handleScheduleUpdate}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </Paper>
  );
};

export default MyCalendar;