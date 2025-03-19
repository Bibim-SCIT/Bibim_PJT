import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Divider, Stack, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import MyCalendar from './MyCalendar';
import MyGanttChart from './MyGanttChart';
import { getMySchedule, convertToCalendarFormat, convertToGanttFormat, getValidImageUrl } from '../../../api/mypage';

const MySchedule = ({ workspaces = [] }) => {
  const [view, setView] = useState("calendar"); // 현재 선택된 뷰 (calendar 또는 gantt)
  const [ganttTasks, setGanttTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 워크스페이스 ID를 기반으로 워크스페이스 이미지를 찾는 함수
  const getWorkspaceImageById = useCallback((wsId) => {
    if (!wsId || !workspaces || !workspaces.length) return null;
    
    const workspace = workspaces.find(ws => ws.wsId === wsId || ws.wsId === parseInt(wsId, 10));
    return workspace ? getValidImageUrl(workspace.wsImg) : null;
  }, [workspaces]);

  // 스케줄에 워크스페이스 이미지 정보 추가
  const enrichScheduleWithWorkspaceData = useCallback((scheduleList) => {
    if (!scheduleList || !scheduleList.length) return [];
    
    return scheduleList.map(schedule => {
      // 이미 wsImg가 있으면 검증만 하고, 없으면 워크스페이스 목록에서 찾아서 추가
      const wsImg = schedule.wsImg 
        ? getValidImageUrl(schedule.wsImg) 
        : getWorkspaceImageById(schedule.wsId);
      
      return {
        ...schedule,
        wsImg: wsImg
      };
    });
  }, [getWorkspaceImageById]);
  
  // API에서 스케줄 데이터 가져오기
  const fetchScheduleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMySchedule();
      console.log('스케줄 데이터 응답:', result); // 응답 데이터 확인용 로그
      
      // 응답 형식 확인 및 데이터 처리
      if (result && result.data && Array.isArray(result.data)) {
        // 워크스페이스 이미지 정보 보강
        const enrichedSchedules = enrichScheduleWithWorkspaceData(result.data);
        console.log('워크스페이스 정보가 보강된 스케줄:', enrichedSchedules);
        
        // 간트차트 형식으로 변환
        const ganttData = convertToGanttFormat(enrichedSchedules);
        setGanttTasks(ganttData);
        
        // 캘린더 형식으로 변환
        const calendarData = convertToCalendarFormat(enrichedSchedules);
        setCalendarEvents(calendarData);
      } else {
        console.warn('스케줄 데이터가 없거나 형식이 올바르지 않습니다:', result);
        setGanttTasks([]);
        setCalendarEvents([]);
      }
    } catch (err) {
      console.error('스케줄 데이터 로딩 중 오류 발생:', err);
      setError('스케줄 데이터를 불러오는 중 오류가 발생했습니다.');
      setGanttTasks([]);
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  }, [enrichScheduleWithWorkspaceData]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData, workspaces]); // workspaces가 변경될 때도 다시 로드

  // 캘린더 이벤트 클릭 핸들러 - useCallback으로 메모이제이션
  const handleCalendarEventClick = useCallback((clickInfo) => {
    console.log('선택된 일정:', clickInfo.event.extendedProps);
    // 모달은 MyCalendar 컴포넌트 내에서 처리됨
  }, []);

  // 간트 차트 이벤트 클릭 핸들러 - useCallback으로 메모이제이션
  const handleGanttTaskClick = useCallback((task) => {
    console.log('간트 차트에서 선택된 일정:', task);
  }, []);

  // 스케줄 업데이트 후 새로고침
  const handleScheduleUpdate = useCallback(() => {
    // 데이터 다시 불러오기
    fetchScheduleData();
  }, [fetchScheduleData]);

  // 뷰 변경 핸들러 - useCallback으로 메모이제이션
  const handleViewChange = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  // 로딩 중 표시
  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <Box sx={{ width: '100%', p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }
  
  // 데이터가 비어있을 때 표시
  const isEmptyData = (view === 'calendar' && (!calendarEvents || calendarEvents.length === 0)) ||
                     (view === 'gantt' && (!ganttTasks || ganttTasks.length === 0));

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{
        p: 3,
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontWeight: 600,
            color: '#333'
          }}>
            내 일정 관리
          </Typography>
          
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
            sx={{
              '& .MuiToggleButton-root': {
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '8px',
                mx: 0.5,
                py: 0.8,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }
              }
            }}
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarMonthIcon sx={{ marginRight: 1 }} /> 캘린더뷰
            </ToggleButton>
            <ToggleButton value="gantt" aria-label="gantt view">
              <InsertChartIcon sx={{ marginRight: 1, transform: 'rotate(90deg)' }} /> 간트차트 뷰
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        {isEmptyData ? (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              px: 3,
              bgcolor: '#f9f9f9',
              borderRadius: 2,
              border: '1px dashed #ccc'
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 60, color: '#aaa', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={500} gutterBottom>
              등록된 일정이 없습니다
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              워크스페이스에서 새로운 일정을 추가하면 이곳에 표시됩니다.
            </Typography>
          </Box>
        ) : view === "calendar" ? (
          <MyCalendar 
            scheduleData={calendarEvents} 
            onEventClick={handleCalendarEventClick} 
            onDeleteSuccess={handleScheduleUpdate}
            workspaces={workspaces}
          />
        ) : (
          <MyGanttChart 
            tasks={ganttTasks} 
            onTaskClick={handleGanttTaskClick} 
            workspaces={workspaces}
          />
        )}
      </Box>
    </Box>
  );
};

export default React.memo(MySchedule);