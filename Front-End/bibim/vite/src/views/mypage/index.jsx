import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import MyInfo from './component/myInfo'; 
import MySchedule from './component/mySchedule';
import MyWorkspaces from './component/MyWorkspaces';
import MyWorkData from './component/MyWorkData';
import { getMyWorkspaces } from '../../api/mypage'; // 워크스페이스 데이터를 불러오는 함수

const MyPage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyWorkspaces();
        console.log('워크스페이스 데이터 로드:', data);
        setWorkspaces(data);
      } catch (error) {
        console.error('워크스페이스 데이터 로드 실패:', error);
        setError('워크스페이스 정보를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MyInfo />
      <MySchedule workspaces={workspaces} />
      <MyWorkData workspaces={workspaces} />
      <MyWorkspaces workspaces={workspaces} loading={loading} error={error} /> 
    </Box>
  );
};

export default MyPage;
