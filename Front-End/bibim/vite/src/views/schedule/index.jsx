import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar.jsx';
import { ToggleButton, ToggleButtonGroup, Box, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { fetchKanbanTasks, fetchScheduleTasks } from '../../api/schedule.js';

// 아이콘 import
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsertChartIcon from '@mui/icons-material/InsertChart';

// project imports
import MainCard from "ui-component/cards/MainCard";
import ScheduleCreateModal from './components/ScheduleCreateModal.jsx';
import ScheduleEditModal from './components/ScheduleEditModal.jsx';
import ScheduleLoading from './components/ScheduleLoading';
import KanbanBoard from './components/KanbanBoard.jsx';
import GanttChart from './components/GanttChart.jsx';
import TagCreateModal from './components/TagCreateModal.jsx';  // ✅ 태그 생성 모달 추가
import TagEditModal from './components/TagEditModal.jsx';  // ✅ 태그 수정 모달 추가


const SchedulePage = () => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
  const [isModalOpen, setModalOpen] = useState(false); // 모달 상태
  const [isModalOpen2, setModalOpen2] = useState(false);
  const [isTagCreateModalOpen, setTagCreateModalOpen] = useState(false); // ✅ 태그 생성 모달
  const [isTagEditModalOpen, setTagEditModalOpen] = useState(false); // ✅ 태그 수정 모달
  const [view, setView] = useState("calendar"); // ✅ 현재 선택된 뷰 상태 추가
  const [tasks, setTasks] = useState([]); // ✅ 일정 데이터
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태
  const [error, setError] = useState(null); // ✅ 에러 상태
  const wsId = activeWorkspace?.wsId;

  // ✅ 한 번만 데이터 불러오기
  useEffect(() => {
    const loadSchedules = async () => {
      if (!wsId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchScheduleTasks(wsId);
        console.log("📌 일정 데이터 로드 완료:", data);
        setTasks(data);
      } catch (error) {
        console.error("❌ 일정 데이터 로드 실패:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [wsId]);

  // ✅ 토글 버튼 클릭 시 뷰 변경
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <MainCard title="일정 관리">
      {/* 상단 뷰 - 캘린더뷰, 간트차트뷰 토글버튼 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <Typography variant="h4" component="h1">{activeWorkspace.wsName}의 일정</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <ToggleButtonGroup
            value={view} // ✅ 현재 선택된 뷰 유지
            exclusive
            onChange={handleViewChange} // ✅ 뷰 변경 핸들러
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarMonthIcon sx={{ marginRight: 1 }} /> 캘린더뷰
            </ToggleButton>
            <ToggleButton value="gantt" aria-label="gantt view">
              <InsertChartIcon sx={{ marginRight: 1 }} /> 간트차트 뷰
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ✅ 일정 데이터 로드 실패 시 에러 메시지 표시 */}
      {error && (
        <Box sx={{ textAlign: "center", padding: "20px", color: "red" }}>
          ⚠️ 일정 데이터 로드 실패: {error.message || "알 수 없는 오류"}
        </Box>
      )}

      {/* ✅ 로딩 중이면 해당 영역에만 로딩 표시 */}
      <Box sx={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? (
          <ScheduleLoading />
        ) : (
          view === "calendar" ? <Calendar tasks={tasks} /> : <GanttChart tasks={tasks} />
        )}
      </Box>

      {/* 스케줄 생성 버튼 추가 */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
          일정 생성
        </Button>
        <Button variant="contained" color="primary" onClick={() => setModalOpen2(true)}>
          일정 수정
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setTagCreateModalOpen(true)}>
          태그 생성
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setTagEditModalOpen(true)}>
          태그 수정
        </Button>
      </Box>
      <KanbanBoard wsId={wsId} />
      {/* 일정 생성 모달 추가 */}
      <ScheduleCreateModal open={isModalOpen} onClose={() => setModalOpen(false)} />
      <ScheduleEditModal open={isModalOpen2} onClose={() => setModalOpen2(false)} />
      {/* ✅ 태그 생성 & 수정 모달 */}
      <TagCreateModal open={isTagCreateModalOpen} onClose={() => setTagCreateModalOpen(false)} />
      <TagEditModal open={isTagEditModalOpen} onClose={() => setTagEditModalOpen(false)} />
    </MainCard >
  );
};

export default SchedulePage;
