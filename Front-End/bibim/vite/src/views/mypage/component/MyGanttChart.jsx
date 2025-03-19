import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Paper, Tooltip } from '@mui/material';
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import dayjs from "dayjs";
import { styled } from "@mui/material/styles";
import MyGanttScheduleDetailModal from './MyGanttScheduleDetailModal';

// GanttWrapper 정의 업데이트
const GanttWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  overflow: 'hidden',
  "& .gantt-task-row": {
    height: "40px !important", // 행 높이 줄임
  },
  "& .bar-wrapper": {
    overflow: "visible", // 바가 행을 넘어갈 수 있도록
  },
  // 간트차트 호버 효과 재정의
  "& .bar-wrapper:hover": {
    transform: "scale(1.003)",
    filter: "brightness(1.03)",
    zIndex: 5,
  },
  "& .gantt-task-row:hover": {
    backgroundColor: "#f9f9f9",
  },
  // 파스텔 색상 테마에 맞는 스타일 조정
  "& .gantt-task-info": {
    color: "#000000", // 텍스트 색상을 검정색으로 변경
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
  },
  // 바 모서리 둥글게
  "& .bar-wrapper .bar": {
    borderRadius: "6px",
  },
  // 그리드 선 색상 조정
  "& .gantt-horizontal-container .gantt-row-line": {
    borderTop: "1px solid #f0f0f0",
  },
  "& .gantt-vertical-container .gantt-calendar-row-line": {
    borderRight: "1px solid #f0f0f0",
  },
  // 바 텍스트 색상 변경
  "& .bar-wrapper .bar-label": {
    color: "#000000 !important", // 바 레이블 텍스트 색상을 검정색으로 변경 (important 추가)
    fontWeight: "400",
  },
  // 타임라인 헤더 텍스트 색상 변경
  "& .gantt-task-bg .calendar": {
    color: "#000000 !important", // 타임라인 헤더 텍스트 색상을 검정색으로 변경 (important 추가)
  },
  // 추가: 타임라인의 모든 텍스트를 검정색으로
  "& .gantt-task-bg .calendar-header": {
    color: "#000000 !important", // 타임라인 헤더 텍스트 색상을 검정색으로 변경 (important 추가)
  },
  "& .calendar-header-day": {
    color: "#000000 !important", // 요일 텍스트 색상을 검정색으로 변경 (important 추가)
  },
  "& .calendar-header-month": {
    color: "#000000 !important", // 월 텍스트 색상을 검정색으로 변경 (important 추가)
  },
  // 날짜 숫자 텍스트 색상 변경
  "& .calendar-row .calendar-cell": {
    color: "#000000 !important", // 날짜 숫자 텍스트 색상을 검정색으로 변경 (important 추가)
  },
  // 타임라인의 모든 텍스트 색상 변경
  "& .gantt": {
    color: "#000000 !important", // 간트차트 전체 텍스트 색상을 검정색으로 변경 (important 추가)
  }
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
    <div style={{ 
      background: "#fff", 
      color: "#000000", // 검정색으로 변경
      padding: "10px", 
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      maxWidth: "300px",
      border: "1px solid #eee"
    }}>
      <div style={{ 
        width: "100%", 
        height: "6px", 
        backgroundColor: task.styles?.backgroundColor || "#38B3FB",
        marginBottom: "10px",
        borderRadius: "3px"
      }}></div>
      <p style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "8px", color: "#000000" }}>{task.name}</p>
      <p style={{ fontSize: "12px", marginBottom: "5px", color: "#000000" }}>
        <strong>워크스페이스:</strong> {task.wsName || "미지정"}
      </p>
      <p style={{ fontSize: "12px", marginBottom: "5px", color: "#000000" }}>
        <strong>시작:</strong> {formatDate(task.start)}
      </p>
      <p style={{ fontSize: "12px", marginBottom: "5px", color: "#000000" }}>
        <strong>종료:</strong> {formatDate(task.end)}
      </p>
      <p style={{ fontSize: "12px", marginBottom: "0", color: "#000000" }}>
        <strong>상태:</strong> {taskStatus.label}
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
    gridTemplateColumns: "50% 25% 25%", // 컬럼 크기 조정
    alignItems: "center",
    fontWeight: "bold",
    background: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    padding: "5px"
  }}>
    <span>작업명</span>
    <span>시작일</span> {/* 시작일로 변경 */}
    <span>종료일</span> {/* 종료일로 변경 */}
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
          gridTemplateColumns: "50% 25% 25%", // 컬럼 크기 조정
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
        <span>{formatDate(task.start)}</span> {/* 시작일 표시 */}
        <span>{formatDate(task.end)}</span> {/* 종료일 표시 */}
      </div>
    ))}
  </div>
);

// 데이터 변환 함수 추가
const transformTaskData = (task) => {
  // 디버깅을 위한 로그 추가
  console.log("변환 전 task 데이터:", task);
  
  // 간트차트 task 데이터를 MyGanttScheduleDetailModal에서 사용하는 형식으로 변환
  const transformedData = {
    scheduleNumber: task.id,
    scheduleTitle: task.name,
    scheduleContent: task.extendedProps?.content || "",
    scheduleStartDate: task.start,
    scheduleFinishDate: task.end,
    scheduleStatus: task.status || "UNASSIGNED",
    scheduleModifytime: task.extendedProps?.modifyTime || new Date().toISOString(),
    // 워크스페이스 정보 추출 - 여러 가능한 위치에서 찾기
    wsName: task.wsName || task.extendedProps?.wsName || "미지정",
    wsId: task.wsId || task.extendedProps?.wsId,
    // 워크스페이스 이미지 정보 추가
    wsImg: task.wsImg || task.extendedProps?.wsImg || "",
    // 태그 정보
    tag1: task.extendedProps?.tag1 || "",
    tag2: task.extendedProps?.tag2 || "",
    tag3: task.extendedProps?.tag3 || "",
    // 색상 정보
    color: task.styles?.backgroundColor || task.backgroundColor || "#38B3FB",
  };
  
  console.log("변환 후 데이터:", transformedData);
  return transformedData;
};

const MyGanttChart = ({ tasks, onTaskClick }) => {
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 간트 차트 뷰 모드 변경 핸들러
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Task 클릭 시 모달 열기
  const handleTaskClick = (task) => {
    console.log("클릭한 Task 원본 데이터:", task);
    const transformedData = transformTaskData(task);
    console.log("변환된 Task 데이터:", transformedData);
    setSelectedTask(transformedData);
    setIsModalOpen(true);
  };

  // 브라우저에 스타일 직접 삽입하여 간트차트 텍스트 색상 변경
  React.useEffect(() => {
    // 스타일 요소 생성
    const style = document.createElement('style');
    style.innerHTML = `
      .gantt-task-bg .calendar-row span,
      .gantt-task-bg .calendar-header,
      .gantt-task-bg .calendar-header span,
      .bar-wrapper .bar-label,
      .gantt-calendar-row .calendar-cell {
        color: #000000 !important;
      }
    `;
    
    // 헤드에 스타일 요소 추가
    document.head.appendChild(style);
    
    // 컴포넌트 언마운트 시 스타일 제거
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
                border: '1px solid rgba(0, 0, 0, 0.08)',
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
            padding: 2,
            textAlign: 'center',
            color: '#000000' // 텍스트 검정색으로 변경
          }}>
            <p>⏳ 등록된 작업이 없습니다.</p>
          </Box>
        )}

        {/* 스케줄 상세 모달 */}
        {isModalOpen && (
          <MyGanttScheduleDetailModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            schedule={selectedTask}
            onUpdate={(updatedSchedule) => {
              console.log("업데이트된 스케줄:", updatedSchedule);
              setIsModalOpen(false);
            }}
            onDeleteSuccess={() => {
              console.log("스케줄 삭제 성공");
              setIsModalOpen(false);
              // 필요하다면 여기에 데이터 리로드 로직 추가
            }}
          />
        )}
      </GanttWrapper>
    </Paper>
  );
};

export default MyGanttChart;