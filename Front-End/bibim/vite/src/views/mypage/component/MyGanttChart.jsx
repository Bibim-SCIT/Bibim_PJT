import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Paper } from '@mui/material';
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import dayjs from "dayjs";
import { styled } from "@mui/material/styles";

// GanttWrapper 정의 업데이트
const GanttWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  overflow: 'hidden',
});

// 날짜를 'YYYY.MM.DD' 형식으로 변환하는 함수
const formatDate = (date) => dayjs(date).format("YYYY.MM.DD");

const statusMapping = {
  UNASSIGNED: { label: "미배정" },
  IN_PROGRESS: { label: "진행 중" },
  COMPLETED: { label: "완료" },
  ON_HOLD: { label: "보류" },
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ task }) => {
  const taskStatus = statusMapping[task.status] || { label: "알 수 없음" };

  return (
    <div style={{ background: "#222", color: "#fff", padding: "5px", borderRadius: "0" }}>
      <p><strong>{task.name}</strong></p>
      <p>시작: {formatDate(task.start)}</p>
      <p>종료: {formatDate(task.end)}</p>
      <p>워크스페이스: {task.wsName}</p>
      <p>상태: {taskStatus.label}</p>
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

// 커스텀 Task List Table
const CustomTaskListTable = ({ tasks, rowHeight, onTaskClick }) => (
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
);

const MyGanttChart = ({ tasks, onTaskClick }) => {
  const [viewMode, setViewMode] = useState(ViewMode.Day);

  // 간트 차트 뷰 모드 변경 핸들러
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ 
        width: '100%',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 3px 10px rgba(0,0,0,0.03), 0 1px 5px rgba(0,0,0,0.02)'
        }
      }}
    >
      <GanttWrapper>
        <Box sx={{ textAlign: "right", mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="Gantt View Mode"
            sx={{
              '& .MuiToggleButton-root': {
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '8px',
                mx: 0.5,
                py: 0.8,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }
              }
            }}
          >
            <ToggleButton value={ViewMode.Week} aria-label="Week View">
              주 단위 보기
            </ToggleButton>
            <ToggleButton value={ViewMode.Day} aria-label="Day View">
              일 단위 보기
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        {tasks.length > 0 ? (
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            columnWidth={80}
            barCornerRadius={0}
            fontSize={12}
            locale="ko"
            TooltipContent={CustomTooltip}
            preStepsCount={5}
            viewDate={new Date()}
            listCellWidth="120px"
            TaskListHeader={CustomTaskListHeader}
            TaskListTable={(props) => <CustomTaskListTable {...props} onTaskClick={onTaskClick} />}
          />
        ) : (
          <Box sx={{
            width: '100%',
            padding: 2,
            textAlign: 'center'
          }}>
            <p>⏳ 등록된 작업이 없습니다.</p>
          </Box>
        )}
      </GanttWrapper>
    </Paper>
  );
};

export default MyGanttChart;