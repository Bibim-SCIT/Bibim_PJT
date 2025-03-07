import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import GanttChart from './components/GanttChart';
import KanbanBoard from '../components/KanbanBoard';
import { useSelector, useDispatch } from 'react-redux';
import { loadWorkspace } from '../../../store/workspaceRedux';

const ScheduleWrapper = styled(Box)({
  padding: '20px',
  height: '100vh', // 전체 화면 높이 사용
  display: 'flex',
  flexDirection: 'column',
  gap: '20px' // 간트 차트와 칸반 보드 사이 여백
});

const GanttContainer = styled(Box)({
  flex: 1, // 상단 50% 차지
  minHeight: '50vh',
  overflow: 'hidden',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
});

const KanbanContainer = styled(Box)({
  flex: 1, // 하단 50% 차지
  minHeight: '50vh',
  overflow: 'hidden',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
});

const SchedulePage = () => {
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
  const wsId = activeWorkspace?.wsId;

  useEffect(() => {
    dispatch(loadWorkspace());
  }, [dispatch]);

  return (
    <ScheduleWrapper>
      <Typography variant="h4" component="h1">
        {activeWorkspace ? `워크스페이스: ${activeWorkspace.wsName}` : '워크스페이스 로딩 중...'}
      </Typography>
      <Typography variant="h6">워크스페이스 ID: {wsId}</Typography>

      {/* 간트 차트 */}
      <GanttContainer>
        <Typography variant="h5" gutterBottom>📅 간트 차트</Typography>
        <GanttChart wsId={wsId} />
      </GanttContainer>

      {/* 칸반 보드 */}
      <KanbanContainer>
        <Typography variant="h5" gutterBottom>📌 칸반 보드</Typography>
        <KanbanBoard wsId={wsId} />
      </KanbanContainer>
    </ScheduleWrapper>
  );
};

export default SchedulePage;
