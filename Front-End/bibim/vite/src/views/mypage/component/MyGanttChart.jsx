import React, { useState, useCallback, useMemo } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import dayjs from "dayjs";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // 미배정
import PlayCircleIcon from '@mui/icons-material/PlayCircle'; // 진행 중
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // 완료
import PauseCircleIcon from '@mui/icons-material/PauseCircle'; // 보류

// GanttChart 컴포넌트와 동일한 스타일 적용
const GanttWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  overflow: 'hidden',
});

// 날짜를 'YYYY.MM.DD' 형식으로 변환하는 함수
const formatDate = (date) => dayjs(date).format("YYYY.MM.DD");

const statusMapping = {
  UNASSIGNED: { label: "미배정", icon: <HourglassEmptyIcon /> },
  IN_PROGRESS: { label: "진행 중", icon: <PlayCircleIcon /> },
  COMPLETED: { label: "완료", icon: <CheckCircleIcon /> },
  ON_HOLD: { label: "보류", icon: <PauseCircleIcon /> },
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ task }) => {
  const taskStatus = statusMapping[task.status] || { label: "알 수 없음", icon: null };

  return (
    <div style={{ background: "#222", color: "#fff", padding: "5px", borderRadius: "5px" }}>
      <p><strong>{task.name}</strong></p>
      <p>시작: {formatDate(task.start)}</p>
      <p>종료: {formatDate(task.end)}</p>
      <p>워크스페이스: {task.wsName}</p>
      <p>
        상태: {taskStatus.icon} {taskStatus.label}
      </p>
    </div>
  );
};

// 커스텀 Task List 헤더
const CustomTaskListHeader = ({ headerHeight, rowWidth }) => (
  <div style={{
    height: headerHeight,
    width: "350px",
    display: "grid",
    gridTemplateColumns: "50% 25% 25%",
    alignItems: "center",
    fontWeight: "bold",
    background: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    padding: "5px"
  }}>
    <span>작업명</span>
    <span>시작일</span>
    <span>종료일</span>
  </div>
);

// 커스텀 Task List Table - 메모이제이션 적용
const CustomTaskListTable = React.memo(({ tasks, rowHeight, onTaskClick }) => (
  <div>
    {tasks.map((task) => (
      <div
        key={task.id}
        style={{
          height: rowHeight,
          width: "350px",
          display: "grid",
          gridTemplateColumns: "50% 25% 25%",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          padding: "5px",
          cursor: "pointer",
          backgroundColor: "#fff",
          transition: "background-color 0.2s ease-in-out",
        }}
        onClick={() => onTaskClick(task)}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
      >
        <span>{task.name}</span>
        <span>{formatDate(task.start)}</span>
        <span>{formatDate(task.end)}</span>
      </div>
    ))}
  </div>
));

const MyGanttChart = ({ tasks, onTaskClick }) => {
  const [viewMode, setViewMode] = useState(ViewMode.Day);

  // 뷰 모드 변경 함수 - useCallback으로 메모이제이션
  const handleViewModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);

  // Task 클릭 핸들러 - useCallback으로 메모이제이션
  const handleTaskClick = useCallback((task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  }, [onTaskClick]);

  // 간트 차트 렌더링 최적화를 위한 메모이제이션
  const memoizedTasks = useMemo(() => tasks, [tasks]);

  return (
    <GanttWrapper>
      <Box sx={{ textAlign: "right", mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="Gantt View Mode"
        >
          <ToggleButton value={ViewMode.Week} aria-label="Week View">
            주 단위 보기
          </ToggleButton>
          <ToggleButton value={ViewMode.Day} aria-label="Day View">
            일 단위 보기
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {memoizedTasks.length > 0 ? (
        <Gantt
          tasks={memoizedTasks}
          viewMode={viewMode}
          columnWidth={80}
          barCornerRadius={5}
          fontSize={12}
          locale="ko"
          TooltipContent={CustomTooltip}
          preStepsCount={5}
          viewDate={new Date()}
          listCellWidth="120px"
          TaskListHeader={CustomTaskListHeader}
          TaskListTable={(props) => <CustomTaskListTable {...props} onTaskClick={handleTaskClick} />}
        />
      ) : (
        <Box sx={{
          width: '100%',
          maxWidth: '1200px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <p>⏳ 등록된 작업이 없습니다.</p>
        </Box>
      )}
    </GanttWrapper>
  );
};

// 컴포넌트 자체를 메모이제이션하여 불필요한 리렌더링 방지
export default React.memo(MyGanttChart); 