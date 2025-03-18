import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar.jsx';
import { ToggleButton, ToggleButtonGroup, Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { fetchKanbanTasks, fetchScheduleTasks } from '../../api/schedule.js';

// 아이콘 import
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LabelIcon from '@mui/icons-material/Label';

// project imports
import MainCard from "ui-component/cards/MainCard";
import MainCard4 from '../../ui-component/cards/MainCard4.jsx';
import ScheduleCreateModal from './components/ScheduleCreateModal.jsx';
import ScheduleEditModal from './components/ScheduleEditModal.jsx';
import ScheduleLoading from './components/ScheduleLoading';
import KanbanBoard from './components/KanbanBoard.jsx';
import GanttChart from './components/GanttChart.jsx';
import TagCreateModal from './components/TagCreateModal.jsx';  // ✅ 태그 생성 모달 추가
import TagEditModal from './components/TagEditModal.jsx';  // ✅ 태그 수정 모달 추가


// ✅ 스타일링된 토글 버튼 그룹
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: theme.shadows[2],
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: "bold",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
  },
  "&.Mui-selected:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const SchedulePage = () => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace); // ✅ Redux에서 현재 워크스페이스
  const [isModalOpen, setModalOpen] = useState(false); // 모달 상태
  const [isModalOpen2, setModalOpen2] = useState(false);
  const [isTagCreateModalOpen, setTagCreateModalOpen] = useState(false); // ✅ 태그 생성 모달
  const [isTagEditModalOpen, setTagEditModalOpen] = useState(false); // ✅ 태그 수정 모달
  const [view, setView] = useState("calendar"); // ✅ 현재 선택된 뷰 상태 추가
  const [tasks, setTasks] = useState([]); // ✅ 일정 데이터
  const [schedules, setSchedules] = useState([]); // ✅ 캘린더 데이터 상태 추가
  const [ganttTasks, setGanttTasks] = useState([]); // ✅ 간트차트 데이터 상태 추가
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태
  const [error, setError] = useState(null); // ✅ 에러 상태
  const wsId = activeWorkspace?.wsId;

  // ✅ 일정 데이터 불러오는 함수
  const fetchSchedules = async () => {
    if (!wsId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchScheduleTasks(wsId);
      console.log("📌 일정 데이터 로드 완료:", data);
      setSchedules(data);
      setGanttTasks(data);
    } catch (error) {
      console.error("❌ 일정 데이터 불러오기 실패:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 한 번만 데이터 불러오기
  useEffect(() => {
    fetchSchedules();
  }, [wsId]);

  // ✅ 새 일정이 생성되거나 삭제되면 일정 다시 불러오기
  const handleSchedulesUpdated = () => {
    fetchSchedules();
  };

  // ✅ 새 일정이 생성되면 전체 리스트를 다시 불러오는 함수
  const handleCreateSuccess = async () => {
    if (!wsId) return;

    setLoading(true); // 로딩 시작
    try {
      const updatedSchedules = await fetchScheduleTasks(wsId);
      console.log("📌 일정 데이터 다시 로드 완료:", updatedSchedules);
      setSchedules(updatedSchedules);
      setGanttTasks(updatedSchedules);
    } catch (error) {
      console.error("❌ 일정 데이터 다시 불러오기 실패:", error);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // ✅ `schedules`가 변경될 때 캘린더를 업데이트
  useEffect(() => {
    console.log("📌 schedules가 변경됨:", schedules);
  }, [schedules]);

  // ✅ 토글 버튼 클릭 시 뷰 변경
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <MainCard4 title="의 일정 관리" wsname={activeWorkspace.wsName}>
      {/* 상단 뷰 - 캘린더뷰, 간트차트뷰 토글버튼 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        {/* <Typography variant="h4" component="h1">{activeWorkspace.wsName}의 일정</Typography> */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setModalOpen(true)}
        >
          일정 생성
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* <ToggleButtonGroup
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
          </ToggleButtonGroup> */}
          <StyledToggleButtonGroup value={view} exclusive onChange={handleViewChange}>
            <StyledToggleButton value="calendar">
              <CalendarMonthIcon sx={{ mr: 1 }} /> 캘린더뷰
            </StyledToggleButton>
            <StyledToggleButton value="gantt">
              <InsertChartIcon sx={{ mr: 1 }} /> 간트차트 뷰
            </StyledToggleButton>
          </StyledToggleButtonGroup>
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
          view === "calendar" ? <Calendar tasks={schedules} onDeleteSuccess={handleSchedulesUpdated} /> : <GanttChart tasks={ganttTasks} onDeleteSuccess={handleSchedulesUpdated} />
        )}
      </Box>

      {/* 기능 버튼 (일정 생성, 태그 생성, 태그 편집) */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 2, justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setModalOpen(true)}
        >
          일정 생성
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setTagCreateModalOpen(true)}>
          태그 생성
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setTagEditModalOpen(true)}>
          태그 편집
        </Button>
      </Box>
      {/* ✅ setSchedules, setGanttTasks를 KanbanBoard에 전달 */}
      <KanbanBoard wsId={wsId} setSchedules={setSchedules} setGanttTasks={setGanttTasks} />
      {/* 일정 생성 모달 추가 */}
      <ScheduleCreateModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreateSuccess={handleSchedulesUpdated} // ✅ 새 일정 반영
      />
      <ScheduleEditModal open={isModalOpen2} onClose={() => setModalOpen2(false)} />
      {/* ✅ 태그 생성 & 수정 모달 */}
      <TagCreateModal open={isTagCreateModalOpen} onClose={() => setTagCreateModalOpen(false)} />
      <TagEditModal open={isTagEditModalOpen} onClose={() => setTagEditModalOpen(false)} />
    </MainCard4 >
  );
};

export default SchedulePage;
