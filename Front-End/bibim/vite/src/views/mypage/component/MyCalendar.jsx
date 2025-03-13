import React from 'react';
import { Box, Paper } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const MyCalendar = ({ scheduleData, onEventClick }) => {
  // 이벤트 호버 핸들러
  const handleEventHover = (scheduleId, isHovering) => {
    const events = document.querySelectorAll(`[data-schedule-id="${scheduleId}"]`);
    events.forEach(event => {
      event.classList.toggle('schedule-highlight', isHovering);
    });
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
          boxShadow: '0 3px 10px rgba(0,0,0,0.03), 0 1px 5px rgba(0,0,0,0.02)',
          transform: 'translateY(-1px)'
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
          eventClick={onEventClick}
          eventDidMount={(info) => {
            const scheduleId = info.event.id;
            info.el.setAttribute('data-schedule-id', scheduleId);

            info.el.addEventListener('mouseenter', () => handleEventHover(scheduleId, true));
            info.el.addEventListener('mouseleave', () => handleEventHover(scheduleId, false));
          }}
          eventContent={(arg) => (
            <Box
              sx={{
                '& .fc-daygrid-event-harness': {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                },
                '& .fc-daygrid-event': {
                  padding: '4px',
                  borderRadius: '5px',
                  fontSize: '13px',
                },
                '& .fc-event-title': {
                  lineHeight: '1.2',
                },
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: arg.event.backgroundColor,
                  marginRight: '4px'
                }}></span>
                <span style={{ fontWeight: 'bold' }}>[{arg.event.extendedProps.wsName}]</span> {arg.event.title}
              </div>
            </Box>
          )}
        />
      </Box>
    </Paper>
  );
};

export default MyCalendar;