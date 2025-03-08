import React, { useState } from 'react';
import Calendar from './components/calendar.jsx';
// import { styled } from '@mui/material/styles';
import { ToggleButton, ToggleButtonGroup, Box, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // ✅ 페이지 이동을 위한 Hook 추가

// 아이콘 import
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsertChartIcon from '@mui/icons-material/InsertChart';

// project imports
import MainCard from "ui-component/cards/MainCard";
import ScheduleCreateModal from './components/ScheduleCreateModal';
import ScheduleEditModal from '../components/ScheduleEditModal.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';

const SchedulePage = () => {
  const navigate = useNavigate(); // ✅ 페이지 이동을 위한 Hook
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
  const [isModalOpen, setModalOpen] = useState(false); // 모달 상태
  const [isModalOpen2, setModalOpen2] = useState(false);
  const wsId = activeWorkspace?.wsId;

  return (
    <MainCard title="일정 관리">
      {/* 상단 뷰 - 캘린더뷰, 간트차트뷰 토글버튼 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <Typography variant="h4" component="h1">{activeWorkspace.wsName}의 일정 관리</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <ToggleButtonGroup>
            <ToggleButton value="table" aria-label="calendar view">
              <CalendarMonthIcon sx={{ marginRight: 1 }} /> 캘린더뷰
            </ToggleButton>
            <ToggleButton value="card" aria-label="gantt view" onClick={() => navigate(`/schedule/gantt`)}>
              <InsertChartIcon sx={{ marginRight: 1 }} /> 간트차트 뷰
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <Calendar wsId={wsId} />
      {/* 스케줄 생성 버튼 추가 */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
          일정 생성
        </Button>
        <Button variant="contained" color="primary" onClick={() => setModalOpen2(true)}>
          일정 수정
        </Button>
      </Box>
      <KanbanBoard wsId={wsId} />
      {/* 일정 생성 모달 추가 */}
      <ScheduleCreateModal open={isModalOpen} onClose={() => setModalOpen(false)} />
      <ScheduleEditModal open={isModalOpen2} onClose={() => setModalOpen2(false)} />
    </MainCard >
  );
};

export default SchedulePage;
