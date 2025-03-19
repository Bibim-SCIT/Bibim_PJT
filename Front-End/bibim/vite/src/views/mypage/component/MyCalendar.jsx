import React, { useState, useCallback } from 'react';
import { Box, Paper, Avatar, Typography, Tooltip } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import MyCalendarScheduleDetailModal from './MyCalendarScheduleDetailModal';
import defaultWorkspaceIcon from "assets/images/icons/bibimsero.png"; // 기본 워크스페이스 이미지 추가
import { getValidImageUrl } from "../../../api/mypage";

const MyCalendar = ({ scheduleData, onEventClick, onDeleteSuccess, workspaces = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // 빈 데이터 체크
  const isEmpty = !scheduleData || scheduleData.length === 0;

  // 워크스페이스 ID로 워크스페이스 데이터 찾기
  const getWorkspaceById = useCallback((wsId) => {
    if (!wsId || !workspaces || !workspaces.length) return null;
    return workspaces.find(ws => ws.wsId === wsId || ws.wsId === parseInt(wsId, 10)) || null;
  }, [workspaces]);

  // 이벤트 호버 핸들러
  const handleEventHover = (scheduleId, isHovering) => {
    const events = document.querySelectorAll(`[data-schedule-id="${scheduleId}"]`);
    events.forEach(event => {
      event.classList.toggle('schedule-highlight', isHovering);
    });
  };
  
  // 이벤트 클릭 핸들러
  const handleEventClick = (clickInfo) => {
    // 워크스페이스 ID 가져오기
    const wsId = clickInfo.event.extendedProps.wsId;
    
    // 워크스페이스 정보 찾기
    const workspace = getWorkspaceById(wsId);
    
    // 워크스페이스 이미지 정보가 포함되도록 이벤트 데이터를 가공
    const scheduleData = {
      ...clickInfo.event.extendedProps,
      // 워크스페이스 이미지 처리 개선
      wsImg: workspace ? getValidImageUrl(workspace.wsImg) : 
             clickInfo.event.extendedProps.wsImg ? getValidImageUrl(clickInfo.event.extendedProps.wsImg) : 
             defaultWorkspaceIcon
    };
    
    setSelectedSchedule(scheduleData);
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
            borderRadius: 0,
            padding: '1px 2px',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            height: 'auto',
            lineHeight: '1.1',
            border: 'none',
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
          '& .schedule-highlight': {
            transform: 'scale(1.008)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            zIndex: 5,
            opacity: 0.95,
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
            
            // 이벤트 색상 적용 - 항상 extendedProps.color 또는 backgroundColor 사용
            const eventColor = info.event.extendedProps.color || info.event.backgroundColor || '#38B3FB';
            info.el.style.backgroundColor = eventColor;
            info.el.style.borderColor = eventColor;
            
            // 글자색을 흰색으로 설정
            info.el.style.color = '#FFFFFF';

            info.el.addEventListener('mouseenter', () => handleEventHover(scheduleId, true));
            info.el.addEventListener('mouseleave', () => handleEventHover(scheduleId, false));
          }}
          eventContent={(arg) => {
            const { scheduleStatus, profileImage, wsName, wsId } = arg.event.extendedProps;
            const eventColor = arg.event.extendedProps.color || arg.event.backgroundColor || '#38B3FB';
            
            // 워크스페이스 정보 찾기
            const workspace = getWorkspaceById(wsId);
            
            // 워크스페이스 이미지 가져오기 (개선된 로직)
            let wsImg = arg.event.extendedProps.wsImg;
            
            // 워크스페이스 이미지가 없거나 유효하지 않으면 워크스페이스 데이터에서 가져오기
            if (!wsImg || wsImg === defaultWorkspaceIcon) {
              wsImg = workspace ? getValidImageUrl(workspace.wsImg) : defaultWorkspaceIcon;
            } else {
              // 이미지 URL 유효성 검사
              wsImg = getValidImageUrl(wsImg);
            }
            
            // 제목과 워크스페이스 이름 결합한 툴팁 텍스트
            const tooltipText = `${arg.event.title} [${wsName || '워크스페이스 미지정'}]`;
            
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '20px', // 높이 고정
                  backgroundColor: eventColor,
                  color: '#FFFFFF', // 흰색으로 변경
                  borderRadius: '3px',
                  padding: '1px 4px',
                  fontSize: '12px',
                  lineHeight: '1',
                  width: '100%',
                  justifyContent: 'space-between',
                }}
              >
                {/* 왼쪽 섹션: 일정 제목과 워크스페이스 이름 */}
                <Tooltip title={tooltipText} arrow>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    gap: '4px',
                  }}>
                    {/* 워크스페이스 이미지 (있는 경우만 표시) */}
                    {wsImg && (
                      <Avatar
                        src={wsImg}
                        alt={wsName || '워크스페이스'}
                        variant="rounded"
                        sx={{
                          width: 20,
                          height: 20,
                          border: '1px solid rgba(255,255,255,0.5)',
                          flexShrink: 0,
                          marginRight: '2px',
                        }}
                        onError={(e) => {
                          console.error('캘린더 이벤트 이미지 로딩 오류:', wsImg);
                          e.target.src = defaultWorkspaceIcon;
                        }}
                      />
                    )}
                    
                    {/* 일정 제목 */}
                    <Typography 
                      noWrap 
                      component="span" 
                      sx={{ 
                        fontWeight: 'medium', 
                        fontSize: '12px',
                        color: '#FFFFFF', // 흰색으로 변경
                      }}
                    >
                      {arg.event.title}
                    </Typography>
                    
                    {/* 워크스페이스 정보 - 인라인으로 표시 */}
                    {wsName && (
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontSize: '10px', 
                          opacity: 0.85,
                          fontStyle: 'italic',
                          color: '#FFFFFF', // 흰색으로 변경
                        }}
                      >
                        [{wsName}]
                      </Typography>
                    )}
                  </Box>
                </Tooltip>

                {/* 오른쪽 섹션: 담당자 프로필 이미지 */}
                {scheduleStatus !== 'UNASSIGNED' && profileImage && (
                  <Avatar
                    src={profileImage || ''}
                    sx={{
                      width: 14,
                      height: 14,
                      border: '1px solid rgba(255,255,255,0.5)', // 테두리 색상을 흰색 반투명으로 변경
                      backgroundColor: profileImage ? 'transparent' : 'rgba(255,255,255,0.2)', // 배경색도 흰색 계열로 변경
                      flexShrink: 0,
                      marginLeft: '2px',
                    }}
                  />
                )}
              </Box>
            );
          }}
        />
      </Box>
      
      {/* 일정 상세 모달 */}
      <MyCalendarScheduleDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onUpdate={handleScheduleUpdate}
        onDeleteSuccess={handleDeleteSuccess}
        workspaces={workspaces} // 워크스페이스 데이터 전달
      />
    </Paper>
  );
};

export default MyCalendar;