import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import dayjs from "dayjs";
import MyCalendar from './MyCalendar';
import MyGanttChart from './MyGanttChart';

const MySchedule = () => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [view, setView] = useState("calendar"); // 현재 선택된 뷰 (calendar 또는 gantt)
  const [ganttTasks, setGanttTasks] = useState([]);
  
  // 더미 스케줄 데이터 - FullCalendar 형식으로 변환
  const scheduleData = [
    {
      id: '1',
      title: 'test_schedule_1 수정버전',
      start: '2025-03-10',
      end: '2025-03-18', // FullCalendar에서 end는 exclusive이므로 하루 더 추가
      backgroundColor: '#1976d2',
      borderColor: '#1976d2',
      extendedProps: {
        content: '수정된 내용입니다.',
        wsName: '프로젝트 A',
        wsId: 1,
        status: 'IN_PROGRESS'
      }
    },
    {
      id: '2',
      title: '뭐게요?',
      start: '2025-03-11',
      end: '2025-03-18',
      backgroundColor: '#2196F3',
      borderColor: '#2196F3',
      extendedProps: {
        content: '일정 내용입니다.',
        wsName: '프로젝트 B',
        wsId: 2,
        status: 'UNASSIGNED'
      }
    },
    {
      id: '3',
      title: '비밀',
      start: '2025-03-13',
      end: '2025-03-17',
      backgroundColor: '#FF9800',
      borderColor: '#FF9800',
      extendedProps: {
        content: '비밀 내용입니다.',
        wsName: '프로젝트 C',
        wsId: 3,
        status: 'COMPLETED'
      }
    },
    {
      id: '4',
      title: '뭐게요',
      start: '2025-03-17',
      end: '2025-03-19',
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
      extendedProps: {
        content: '일정 내용입니다.',
        wsName: '프로젝트 D',
        wsId: 4,
        status: 'ON_HOLD'
      }
    }
  ];

  // 스케줄 데이터를 간트 차트 형식으로 변환
  useEffect(() => {
    const formattedTasks = scheduleData.map(task => ({
      id: task.id,
      name: task.title,
      start: dayjs(task.start).toDate(),
      end: dayjs(task.end).toDate(),
      progress: 0,
      dependencies: [],
      type: "task",
      status: task.extendedProps.status,
      wsName: task.extendedProps.wsName,
      extendedProps: task.extendedProps
    }));

    setGanttTasks(formattedTasks);
  }, [scheduleData]);

  // 캘린더 이벤트 클릭 핸들러
  const handleCalendarEventClick = (clickInfo) => {
    setSelectedSchedule(clickInfo.event.extendedProps);
    console.log('선택된 일정:', clickInfo.event.extendedProps);
  };

  // 간트 차트 이벤트 클릭 핸들러
  const handleGanttTaskClick = (task) => {
    setSelectedSchedule(task.extendedProps);
    console.log('선택된 일정:', task.extendedProps);
  };

  // 뷰 변경 핸들러
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

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
            내 스케줄
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
            scheduleData={scheduleData} 
            onEventClick={handleCalendarEventClick} 
          />
        ) : (
          <MyGanttChart 
            tasks={ganttTasks} 
            onTaskClick={handleGanttTaskClick} 
          />
        )}
      </Box>
    </Box>
  );
};

export default MySchedule;