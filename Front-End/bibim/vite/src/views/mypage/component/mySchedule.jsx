import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Divider, Stack, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import dayjs from "dayjs";
import MyCalendar from './MyCalendar';
import MyGanttChart from './MyGanttChart';
import { getMySchedule, convertToCalendarFormat, convertToGanttFormat } from '../../../api/mypage';

const MySchedule = () => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [view, setView] = useState("calendar"); // 현재 선택된 뷰 (calendar 또는 gantt)
  const [ganttTasks, setGanttTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API에서 스케줄 데이터 가져오기
  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMySchedule();
        if (result.success && result.data) {
          // 간트차트 형식으로 변환
          const ganttData = convertToGanttFormat(result.data);
          setGanttTasks(ganttData);
          
          // 캘린더 형식으로 변환
          const calendarData = convertToCalendarFormat(result.data);
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
    };

    fetchScheduleData();
  }, []);

  // 캘린더 이벤트 클릭 핸들러 - useCallback으로 메모이제이션
  const handleCalendarEventClick = useCallback((clickInfo) => {
    setSelectedSchedule(clickInfo.event.extendedProps);
    console.log('선택된 일정:', clickInfo.event.extendedProps);
  }, []);

  // 간트 차트 이벤트 클릭 핸들러 - useCallback으로 메모이제이션
  const handleGanttTaskClick = useCallback((task) => {
    console.log('간트 차트에서 선택된 일정:', task);
    if (task.extendedProps) {
      setSelectedSchedule(task.extendedProps);
    } else {
      // extendedProps가 없는 경우 task 자체를 사용
      setSelectedSchedule({
        content: task.name,
        wsName: task.wsName,
        status: task.status
      });
    }
  }, []);

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

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{
        p: 3,
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 1
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarMonthIcon sx={{ mr: 1 }} />
            내 일정 관리
          </Typography>
          
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarMonthIcon sx={{ marginRight: 1 }} /> 캘린더뷰
            </ToggleButton>
            <ToggleButton value="gantt" aria-label="gantt view">
              <InsertChartIcon sx={{ marginRight: 1 }} /> 간트차트 뷰
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        {view === "calendar" ? (
          <MyCalendar 
            scheduleData={calendarEvents} 
            onEventClick={handleCalendarEventClick} 
          />
        ) : (
          <MyGanttChart 
            tasks={ganttTasks} 
            onTaskClick={handleGanttTaskClick} 
          />
        )}
        
        {selectedSchedule && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6">선택된 일정 정보</Typography>
            <Typography>워크스페이스: {selectedSchedule.wsName}</Typography>
            <Typography>상태: {selectedSchedule.status}</Typography>
            <Typography>내용: {selectedSchedule.content}</Typography>
            {selectedSchedule.tag1 && (
              <Typography>태그: {selectedSchedule.tag1} &gt; {selectedSchedule.tag2} &gt; {selectedSchedule.tag3}</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(MySchedule);