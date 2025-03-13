import React from 'react';
import { Box } from '@mui/material';
import MyInfo from './component/myInfo'; 
import MySchedule from './component/mySchedule';

const MyPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
      <MyInfo />
      <MySchedule />
    </Box>
  );
};

export default MyPage;
