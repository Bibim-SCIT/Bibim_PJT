import React from 'react';
import { Box } from '@mui/material';
import MyInfo from './component/myInfo'; 
import MySchedule from './component/mySchedule';
import MyWorkspaces from './component/MyWorkspaces';
import MyWorkData from './component/MyWorkData';

const MyPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MyInfo />
      <MySchedule />
      <MyWorkData />
      <MyWorkspaces /> 
    </Box>
  );
};

export default MyPage;
