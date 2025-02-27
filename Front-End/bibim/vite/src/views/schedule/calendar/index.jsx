import React from 'react';
import Calendar from './components/calendar.jsx';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

const SchedulePageWrapper = styled(Box)({
  padding: '20px',
  '& h1': {
    marginBottom: '20px',
    color: '#333'
  }
});

const SchedulePage = () => {
  return (
    <SchedulePageWrapper>
      <Typography variant="h4" component="h1">일정 관리</Typography>
      <Calendar />
    </SchedulePageWrapper>
  );
};

export default SchedulePage;
