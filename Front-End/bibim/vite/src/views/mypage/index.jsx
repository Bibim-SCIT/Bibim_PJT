import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import MyInfo from './component/myInfo'; 
import MySchedule from './component/mySchedule';
import MyWorkspaces from './component/MyWorkspaces';
import MyWorkData from './component/MyWorkData';
import { getMyWorkspaces } from '../../api/mypage'; // 워크스페이스 데이터를 불러오는 함수

const MyPage = () => {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const data = await getMyWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    };

    fetchWorkspaces();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MyInfo />
      <MySchedule workspaces={workspaces} />
      <MyWorkData workspaces={workspaces} />
      <MyWorkspaces workspaces={workspaces} /> 
    </Box>
  );
};

export default MyPage;
