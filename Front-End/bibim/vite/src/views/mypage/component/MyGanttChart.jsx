import React, { useState, useCallback, useMemo } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Paper, Tooltip } from '@mui/material';
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import dayjs from "dayjs";
import { styled } from "@mui/material/styles";
import MyGanttScheduleDetailModal from './MyGanttScheduleDetailModal';
import defaultWorkspaceIcon from "assets/images/icons/bibimsero.png";
import { getValidImageUrl } from "../../../api/mypage";

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
  },
  // 하루짜리 일정 처리를 위한 스타일 (최소 너비 설정)
  "& .bar-wrapper .bar": {
    minWidth: "18px !important",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  // 하루짜리 일정 강조
  "& .bar-wrapper.short-task .bar": {
    borderLeft: "2px dashed rgba(255,255,255,0.5) !important",
    borderRight: "2px dashed rgba(255,255,255,0.5) !important",
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

// 커스텀 툴팁 컴포넌트를 함수형 컴포넌트로 변경
const CustomTooltip = ({ task, getWorkspaceImg }) => {
  const taskStatus = statusMapping[task.status] || { label: "알 수 없음" };
  
  // 원래 종료일 확인 (1일이 더해진 날짜인지 확인)
  const originalEndDate = task.extendedProps?.originalEndDate ? 
    formatDate(new Date(task.extendedProps.originalEndDate)) : 
    formatDate(task.end);
  
  // 시작일과 종료일이 같은지 확인
  const isSameDay = task.extendedProps?.originalEndDate ? 
    formatDate(task.start) === formatDate(new Date(task.extendedProps.originalEndDate)) : 
    false;
  
  return (
    <div style={{ 
      background: "#2A2A2A", // 진한 회색으로 변경
      color: "#ffffff", 
      padding: "12px", 
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      maxWidth: "300px",
      border: "1px solid #3A3A3A"
    }}>
      <div style={{ 
        display: "flex",
        alignItems: "center",
        marginBottom: "10px"
      }}>
        {/* 상단 색상 바 */}
        <div style={{ 
          flexGrow: 1,
          height: "6px", 
          backgroundColor: task.styles?.backgroundColor || "#38B3FB",
          borderRadius: "3px"
        }}></div>
      </div>
      
      <p style={{ 
        fontWeight: "bold", 
        fontSize: "15px", 
        marginBottom: "10px", 
        color: "#ffffff",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        paddingBottom: "6px"
      }}>
        {task.name}
      </p>
      
      <p style={{ fontSize: "12px", marginBottom: "6px", color: "#E0E0E0" }}>
        <strong style={{ color: "#ffffff" }}>워크스페이스:</strong> {task.wsName || "미지정"}
      </p>
      <p style={{ fontSize: "12px", marginBottom: "6px", color: "#E0E0E0" }}>
        <strong style={{ color: "#ffffff" }}>시작:</strong> {formatDate(task.start)}
      </p>
      <p style={{ fontSize: "12px", marginBottom: "6px", color: "#E0E0E0" }}>
        <strong style={{ color: "#ffffff" }}>종료:</strong> {originalEndDate}
      </p>
      <p style={{ fontSize: "12px", marginBottom: "0", color: "#E0E0E0" }}>
        <strong style={{ color: "#ffffff" }}>상태:</strong> {taskStatus.label}
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
    {tasks.map((task) => {
      // 원래 종료일 확인
      const originalEndDate = task.extendedProps?.originalEndDate ? 
        formatDate(new Date(task.extendedProps.originalEndDate)) : 
        formatDate(task.end);
        
      return (
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
          <span>{formatDate(task.start)}</span>
          <span>{originalEndDate}</span>
        </div>
      );
    })}
  </div>
);

// 데이터 변환 함수 추가
const transformTaskData = (task, getWorkspaceImg) => {
  // 디버깅을 위한 로그 추가
  console.log("변환 전 task 데이터:", task);
  
  // 워크스페이스 이미지 가져오기
  const wsImg = getWorkspaceImg(task.wsId) || task.wsImg || defaultWorkspaceIcon;
  
  // 원래 종료일 가져오기
  const originalEndDate = task.extendedProps?.originalEndDate || task.end;
  
  // 간트차트 task 데이터를 MyGanttScheduleDetailModal에서 사용하는 형식으로 변환
  const transformedData = {
    scheduleNumber: task.id,
    scheduleTitle: task.name,
    scheduleContent: task.extendedProps?.content || "",
    scheduleStartDate: task.start,
    scheduleFinishDate: originalEndDate, // 원래 종료일 사용
    scheduleStatus: task.status || "UNASSIGNED",
    scheduleModifytime: task.extendedProps?.modifyTime || new Date().toISOString(),
    // 워크스페이스 정보 추출 - 여러 가능한 위치에서 찾기
    wsName: task.wsName || task.extendedProps?.wsName || "미지정",
    wsId: task.wsId || task.extendedProps?.wsId,
    // 워크스페이스 이미지 정보 추가 (개선된 로직)
    wsImg: wsImg,
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

// 간트 차트 바 컴포넌트를 커스텀하기 위한 함수
const customBarComponent = ({
  task,
  isSelected,
  onMouseDown,
  onMouseUp,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  style,
  ...restProps
}) => {
  // 하루짜리 일정인지 확인
  const isOneDayTask = task.extendedProps?.originalEndDate ? 
    dayjs(task.start).format('YYYY-MM-DD') === dayjs(task.extendedProps.originalEndDate).format('YYYY-MM-DD') : 
    false;
  
  // 하루짜리 일정이면 특별한 스타일 적용
  const customStyle = {
    ...style,
    // 최소 너비 보장
    minWidth: isOneDayTask ? '18px' : style.width,
    // 테두리 효과 추가
    borderLeft: isOneDayTask ? '2px dashed rgba(255,255,255,0.5)' : undefined,
    borderRight: isOneDayTask ? '2px dashed rgba(255,255,255,0.5)' : undefined,
    // 배경 패턴 추가 (하루짜리 일정의 경우)
    background: isOneDayTask 
      ? `linear-gradient(135deg, ${style.backgroundColor} 25%, ${style.backgroundColor}dd 25%, ${style.backgroundColor}dd 50%, ${style.backgroundColor} 50%, ${style.backgroundColor} 75%, ${style.backgroundColor}dd 75%, ${style.backgroundColor}dd 100%)`
      : style.backgroundColor,
    backgroundSize: isOneDayTask ? '8px 8px' : undefined,
  };
  
  // 클래스명도 조정
  const className = `${restProps.className || ''} ${isOneDayTask ? 'one-day-task' : ''}`;
  
  return (
    <div
      {...restProps}
      className={className}
      style={customStyle}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bar-label" style={{ color: '#000' }}>
        {task.name}
      </div>
    </div>
  );
};

const MyGanttChart = ({ tasks, onTaskClick, workspaces = [] }) => {
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 워크스페이스 ID로 워크스페이스 이미지 URL을 찾는 함수
  const getWorkspaceImg = useCallback((wsId) => {
    if (!wsId || !workspaces || !workspaces.length) return null;
    
    const workspace = workspaces.find(ws => ws.wsId === wsId || ws.wsId === parseInt(wsId, 10));
    return workspace ? getValidImageUrl(workspace.wsImg) : null;
  }, [workspaces]);

  // 간트 차트 뷰 모드 변경 핸들러
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Task 클릭 시 모달 열기
  const handleTaskClick = (task) => {
    console.log("클릭한 Task 원본 데이터:", task);
    const transformedData = transformTaskData(task, getWorkspaceImg);
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
      
      /* 하루짜리 일정 스타일 */
      .gantt .bar {
        min-width: 18px !important;
      }
      
      /* 마우스 오버 효과 강화 */
      .gantt .bar:hover {
        filter: brightness(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      
      /* 하루짜리 일정 추가 스타일 */
      .one-day-task {
        position: relative;
      }
      
      .one-day-task::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px dashed rgba(255,255,255,0.5);
        border-radius: 5px;
        pointer-events: none;
      }
    `;
    
    // 헤드에 스타일 요소 추가
    document.head.appendChild(style);
    
    // 컴포넌트 언마운트 시 스타일 제거
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 워크스페이스 이미지를 CustomTooltip에 전달하기 위한 컴포넌트 래핑 함수
  const TooltipContent = useCallback(
    (props) => <CustomTooltip {...props} getWorkspaceImg={getWorkspaceImg} />, 
    [getWorkspaceImg]
  );

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
            TooltipContent={TooltipContent}
            preStepsCount={5}
            viewDate={new Date()}
            listCellWidth="120px"
            barFill={75} // 바의 높이 비율 증가
            TaskListHeader={CustomTaskListHeader}
            TaskListTable={(props) => <CustomTaskListTable {...props} onTaskClick={handleTaskClick} />}
            onExpanderClick={() => {}} // 확장 기능 비활성화
            onDoubleClick={handleTaskClick} // 더블 클릭 이벤트 처리
            ganttHeight={400} // 높이 고정
            barComponent={customBarComponent} // 커스텀 바 컴포넌트 적용
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
            workspaces={workspaces}
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