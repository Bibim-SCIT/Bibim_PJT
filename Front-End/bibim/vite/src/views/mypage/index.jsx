import React from 'react';
import { Box } from '@mui/material';
import MyInfo from './component/myInfo'; 
import MySchedule from './component/mySchedule';
import MyWorkspaces from './component/MyWorkspaces';

const MyPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MyInfo />
      <MySchedule />
      <MyWorkspaces />
    </Box>
  );
};

export default MyPage;
