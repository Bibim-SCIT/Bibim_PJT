import React, { useEffect, useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Gantt, ViewMode } from "gantt-task-react"; // ✅ Task 제거
import "gantt-task-react/dist/index.css";
import dayjs from "dayjs"; // ✅ 날짜 변환을 위한 dayjs 추가
import ScheduleDetailModal from "./ScheduleDetailModal"; // ✅ 모달 추가
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // 미배정
import PlayCircleIcon from '@mui/icons-material/PlayCircle'; // 진행 중
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // 완료
import PauseCircleIcon from '@mui/icons-material/PauseCircle'; // 보류

// GanttWrapper 디자인 업데이트
const GanttWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  overflow: 'hidden',
});

// ✅ 날짜를 'YYYY.MM.DD' 형식으로 변환하는 함수
const formatDate = (date) => dayjs(date).format("YYYY.MM.DD");

const statusMapping = {
  UNASSIGNED: { label: "미배정", icon: <HourglassEmptyIcon /> },
  unassigned: { label: "미배정", icon: <HourglassEmptyIcon /> },

  IN_PROGRESS: { label: "진행 중", icon: <PlayCircleIcon /> },
  inProgress: { label: "진행 중", icon: <PlayCircleIcon /> },

  COMPLETED: { label: "완료", icon: <CheckCircleIcon /> },
  completed: { label: "완료", icon: <CheckCircleIcon /> },

  ON_HOLD: { label: "보류", icon: <PauseCircleIcon /> },
  backlog: { label: "보류", icon: <PauseCircleIcon /> },  // "backlog"도 "보류"로 매핑
};


// ✅ 커스텀 툴팁 컴포넌트 (기본 툴팁 오버라이드)
const CustomTooltip = ({ task }) => {
  // console.log("툴팁일정", task);
  const taskStatus = statusMapping[task.status] || { label: "알 수 없음", icon: null };
  // console.log("툴팁상세", taskStatus);

  return (
    <div style={{ background: "#222", color: "#fff", padding: "5px", borderRadius: "5px" }}>
      <p><strong>{task.name}</strong></p>
      <p>시작: {formatDate(task.start)}</p>
      <p>종료: {formatDate(task.end)}</p>
      <p>
        상태: {taskStatus.icon} {taskStatus.label}
      </p>
      {/* <p>담당자: {task.nickname ? task.nickname : "미지정"}</p> */}
    </div>
  );
};


// ✅ 커스텀 Task List 헤더
const CustomTaskListHeader = ({ headerHeight, rowWidth }) => (
  <div style={{
    height: headerHeight,
    width: "350px",
    display: "grid",
    gridTemplateColumns: "50% 25% 25%", // 👉 컬럼 크기 조정
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

// ✅ 커스텀 Task List Table
const CustomTaskListTable = ({ tasks, rowHeight, onTaskClick }) => (
  <div>
    {tasks.map((task) => (
      <div
        key={task.id}
        style={{
          height: rowHeight,
          width: "350px",
          display: "grid",
          gridTemplateColumns: "50% 25% 25%", // 👉 컬럼 크기 조정
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          padding: "5px",
          cursor: "pointer", // ✅ 클릭 가능하도록 설정
          backgroundColor: "#fff",
          transition: "background-color 0.2s ease-in-out",
        }}
        onClick={() => onTaskClick(task)} // ✅ 클릭 시 모달 열기
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

const GanttChart = ({ tasks, onDeleteSuccess }) => {
  const [ganttTasks, setGanttTasks] = useState([]);
  const [viewMode, setViewMode] = useState(ViewMode.Day); // ✅ 기본값: Week
  const [selectedTask, setSelectedTask] = useState(null); // ✅ 선택된 Task 저장
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ 모달 상태

  // ✅ 데이터 변환: 필수 속성이 누락되지 않도록 보정
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const formattedTasks = tasks
      .filter(task => task.start && task.end) // 필수 필드가 없는 데이터 필터링
      .map(task => ({
        id: task.id || `task-${Math.random()}`, // 기본 ID 설정
        name: task.title || "이름 없음",
        // start: new Date(task.start), // 날짜 변환
        // end: new Date(task.end),
        start: dayjs(task.start).toDate(), // ✅ Date 객체 유지
        end: dayjs(task.end).toDate(),
        progress: task.progress || 0, // 기본 진행률 0
        dependencies: task.dependencies || [], // 기본 의존성 []
        type: task.type || "task", // 기본 타입 설정
        status: task.status,
        extendedProps: task, // ✅ 원본 데이터 유지하여 모달에서 활용 가능하도록 추가
      }));

    setGanttTasks(formattedTasks);
  }, [tasks]);

  // ✅ `selectedTask` 변경될 때 모니터링
  useEffect(() => {
    console.log("🎯 선택된 Task 변경됨:", selectedTask);
  }, [selectedTask]);


  // ✅ 뷰 모드 변경 함수
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // ✅ Task 클릭 시 원본 tasks에서 데이터를 찾아서 저장
  const handleTaskClick = (task) => {
    console.log("📌 클릭한 Task (formattedTasks 데이터)", task);

    // ✅ 원본 `tasks`에서 해당 ID와 매칭되는 데이터 찾기
    const originalTask = tasks.find(t => String(t.id) === String(task.id));

    if (originalTask) {
      console.log("✅ 원본 데이터에서 찾은 Task", originalTask);
      setSelectedTask(originalTask);
      setIsModalOpen(true);
    } else {
      console.error("❌ 원본 데이터에서 일치하는 Task를 찾을 수 없음!", task.id);
    }
  };

  // ✅ 스케줄 삭제 시 전체 데이터 다시 불러오기
  const handleScheduleDeleted = () => {
    if (onDeleteSuccess) {
      onDeleteSuccess(); // 부모 컴포넌트(SchedulePage)에서 전체 일정 다시 불러오기
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ 
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
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

        {ganttTasks.length > 0 ? (
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode} // ✅ 동적으로 뷰 모드 적용
            // columnWidth={viewMode === ViewMode.Day ? 80 : 50} // ✅ 일 단위일 때 가독성 개선
            columnWidth={80} // ✅ 날짜 간격을 좁게 설정
            barCornerRadius={5} // ✅ 바 모서리 둥글게
            fontSize={12} // ✅ 폰트 크기 줄이기
            locale="ko" // ✅ 한국어 설정
            TooltipContent={CustomTooltip} // ✅ 커스텀 툴팁 적용
            preStepsCount={5} // ✅ 앞쪽 빈 공간 조정
            viewDate={new Date()} // ✅ 기본 표시 날짜 설정 (오늘 날짜 기준)
            listCellWidth="120px" // ✅ 왼쪽 Task List 너비 조절 (기본값: "155px")
            TaskListHeader={CustomTaskListHeader}
            // TaskListTable={CustomTaskListTable}
            TaskListTable={(props) => <CustomTaskListTable {...props} onTaskClick={handleTaskClick} />} // ✅ Task 클릭 핸들러 추가
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

        {/* ✅ 일정 상세 모달 추가 */}
        <ScheduleDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          schedule={selectedTask?.extendedProps || selectedTask} // ✅ 원본 데이터 유지
          onDeleteSuccess={handleScheduleDeleted} // ✅ 삭제 후 전체 일정 다시 불러오기
        />
      </GanttWrapper>
    </Paper>
  );
};

export default GanttChart;