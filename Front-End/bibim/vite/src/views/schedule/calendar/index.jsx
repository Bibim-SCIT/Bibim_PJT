import React from 'react';
import Calendar from './components/calendar.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const SchedulePageWrapper = styled(Box)({
  padding: '20px',
  '& h1': {
    marginBottom: '20px',
    color: '#333'
  }
});

const SchedulePage = () => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스

  return (
    <SchedulePageWrapper>
      <Typography variant="h4" component="h1">{activeWorkspace.wsName}의 일정 관리</Typography>
      <Calendar />
    </SchedulePageWrapper>
  );
};

export default SchedulePage;
