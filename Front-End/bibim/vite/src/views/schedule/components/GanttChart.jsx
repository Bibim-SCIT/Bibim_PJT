import React, { useEffect, useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Gantt, ViewMode } from "gantt-task-react"; // ✅ Task 제거
import "gantt-task-react/dist/index.css";
import dayjs from "dayjs"; // ✅ 날짜 변환을 위한 dayjs 추가

const GanttWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  overflow: 'hidden',
});

// ✅ 날짜를 'YYYY.MM.DD' 형식으로 변환하는 함수
const formatDate = (date) => dayjs(date).format("YYYY.MM.DD");

// ✅ 커스텀 툴팁 컴포넌트 (기본 툴팁 오버라이드)
const CustomTooltip = ({ task }) => (
  <div style={{ background: "#222", color: "#fff", padding: "5px", borderRadius: "5px" }}>
    <p><strong>{task.name}</strong></p>
    <p>시작: {formatDate(task.start)}</p>
    <p>종료: {formatDate(task.end)}</p>
    <p>상태: {task.status}</p>
  </div>
);


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
const CustomTaskListTable = ({ tasks, rowHeight, rowWidth }) => (
  <div>
    {tasks.map((task) => (
      <div key={task.id} style={{
        height: rowHeight,
        width: "350px",
        display: "grid",
        gridTemplateColumns: "50% 25% 25%", // 👉 컬럼 크기 조정
        alignItems: "center",
        borderBottom: "1px solid #ddd",
        padding: "5px"
      }}>
        <span>{task.name}</span>
        <span>{formatDate(task.start)}</span>
        <span>{formatDate(task.end)}</span>
      </div>
    ))}
  </div>
);

const GanttChart = ({ tasks }) => {
  const [ganttTasks, setGanttTasks] = useState([]);
  const [viewMode, setViewMode] = useState(ViewMode.Day); // ✅ 기본값: Week

  console.log("간트 받아오는 값", tasks);

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
        status: task.status
      }));

    setGanttTasks(formattedTasks);
  }, [tasks]);

  // ✅ 뷰 모드 변경 함수
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

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
          TaskListTable={CustomTaskListTable}
        />
      ) : (
        <p>⏳ 등록된 작업이 없습니다.</p>
      )}
    </GanttWrapper>
  );
};

export default GanttChart;