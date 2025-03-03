import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import GanttChart from './components/GanttChart';
import KanbanBoard from './components/KanbanBoard';
import { useSelector, useDispatch } from 'react-redux';
import { loadWorkspace } from '../../../store/workspaceRedux';

const ScheduleWrapper = styled(Box)({
  padding: '20px',
  '& h1': {
    marginBottom: '20px',
    color: '#333'
  }
});

const SchedulePage = () => {
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.workspace?.activeWorkspace);
  const [view, setView] = React.useState('gantt');
  const wsId = 9; // 🔥 캘린더와 동일한 방식으로 wsId를 하드코딩
  
  React.useEffect(() => {
    dispatch(loadWorkspace());
  }, [dispatch]);

  return (
    <ScheduleWrapper>
      <Typography variant="h4" component="h1">
        {activeWorkspace ? `워크스페이스: ${activeWorkspace.name}` : '워크스페이스 로딩 중...'}
      </Typography>
      <Typography variant="h6">워크스페이스 ID: {wsId}</Typography>

      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(event, newView) => newView && setView(newView)}
        sx={{ marginBottom: '20px' }}
      >
        <ToggleButton value="gantt">간트 차트</ToggleButton>
        <ToggleButton value="kanban">칸반 보드</ToggleButton>
      </ToggleButtonGroup>

      {view === 'gantt' ? <GanttChart wsId={wsId} /> : <KanbanBoard wsId={wsId} />}
    </ScheduleWrapper>
  );
};

export default SchedulePage;