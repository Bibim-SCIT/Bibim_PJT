import React, { useEffect, useState } from "react";
import { Box, Card, Typography, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchKanbanTasks, fetchScheduleTasks, updateKanbanTaskStatus, assignSchedule } from "../../../api/schedule";

const KanbanWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
});

// ✅ 백엔드 상태 코드 매핑
const statusMapping = {
  unassigned: "1",  // 할 일
  inProgress: "2",  // 진행 중
  completed: "3",   // 완료
  backlog: "4"      // 보류
};

// ✅ 상태 코드 역매핑 (백엔드 → 프론트)
const statusMappingReverse = {
  "1": "unassigned",
  "2": "inProgress",
  "3": "completed",
  "4": "backlog"
};

// ✅ 프론트에서 보이는 칸반 보드 컬럼
const columns = {
  unassigned: "할 일",
  inProgress: "진행 중",
  completed: "완료",
  backlog: "보류",
};

const columnColors = {
  unassigned: "#ECF2FF", // 할 일
  inProgress: "#E8F7FF", // 진행 중
  completed: "#FEF5E5", // 완료
  backlog: "#E6FFFA", // 보류
};

const KanbanBoard = ({ wsId, setSchedules, setGanttTasks, onKanbanUpdated, forceRender }) => {
  const [tasks, setTasks] = useState([]);

  // ✅ 기존 useEffect (유지)
  useEffect(() => {
    const loadTasks = async () => {
      if (!wsId) return;

      try {
        const data = await fetchKanbanTasks(wsId);
        console.log("📌 원본 API 응답 데이터:", data);
        setTasks(data);
      } catch (error) {
        console.error("❌ 칸반 보드 데이터 로드 실패:", error);
      }
    };

    loadTasks();
  }, [wsId, forceRender]);

  // ✅ 새롭게 추가할 useEffect (tasks가 변경될 때 실행)
  useEffect(() => {
    if (!wsId) return;
    console.log("🚀 tasks 변경 감지됨! 캘린더 & 간트차트 업데이트 실행");

    // ✅ 이전 상태와 비교하여 변경이 있을 때만 업데이트 실행
    setSchedules(prevSchedules => {
      const newSchedules = JSON.parse(JSON.stringify(tasks));
      return JSON.stringify(prevSchedules) !== JSON.stringify(newSchedules) ? newSchedules : prevSchedules;
    });

    setGanttTasks(prevGanttTasks => {
      const newGanttTasks = JSON.parse(JSON.stringify(tasks));
      return JSON.stringify(prevGanttTasks) !== JSON.stringify(newGanttTasks) ? newGanttTasks : prevGanttTasks;
    });

  }, [tasks]);

  const validStateTransitions = {
    unassigned: ["inProgress", "completed", "backlog"], // 할 일 → 가능
    inProgress: ["completed", "backlog", "unassigned"], // 진행 중 → 가능
    completed: ["inProgress", "backlog", "unassigned"], // 완료 → 가능
    backlog: ["unassigned", "inProgress", "completed"], // 보류 → 가능
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const movedTaskIndex = tasks.findIndex(task => task.id.toString() === result.draggableId);
    if (movedTaskIndex === -1) {
      console.error("❌ 이동할 태스크를 찾을 수 없음!", result.draggableId);
      return;
    }

    const movedTask = { ...tasks[movedTaskIndex] };
    const newStatusKey = result.destination.droppableId;
    let currentStatus = String(movedTask.status).trim();
    let newMappedStatus = String(newStatusKey).trim();

    console.log(`🛠 상태 변환 디버깅
    - movedTask.id: ${movedTask.id}
    - movedTask.status: ${movedTask.status}
    - newStatusKey: ${newStatusKey}
    - newMappedStatus: ${newMappedStatus}
    `);

    if (!validStateTransitions[currentStatus]?.includes(newMappedStatus)) {
      console.warn(`🚨 유효하지 않은 상태 변경 시도: ${currentStatus} → ${newMappedStatus}`);
      return;
    }

    if (currentStatus === newMappedStatus) {
      console.warn(`🚨 상태 변경 불필요: ${currentStatus} → ${newMappedStatus}`);
      return;
    }

    // ✅ 기존 상태 저장 (API 실패 시 롤백을 위해)
    const prevTasks = [...tasks];

    // ✅ 낙관적 UI 업데이트 (즉시 상태 변경)
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === movedTask.id
          ? {
            ...task,
            status: newMappedStatus,
            extendedProps: newMappedStatus === "unassigned" ? {} : task.extendedProps, // 할 일로 이동하면 담당자 제거
          }
          : task
      )
    );

    try {
      if (currentStatus === "unassigned" && newMappedStatus === "inProgress") {
        console.log(`🔄 담당자 자동 배정 실행: scheduleNumber=${movedTask.id}`);
        await assignSchedule(movedTask.id);
      }

      console.log(`🔥 상태 변경 요청: scheduleNumber=${movedTask.id} (${currentStatus} → ${newMappedStatus})`);
      await updateKanbanTaskStatus(movedTask.id, newMappedStatus);
      console.log(`✅ 상태 변경 완료!`);

      // ✅ 최신 데이터 가져오기
      let freshTasks = await fetchScheduleTasks(wsId);
      console.log("📌 최신 스케줄 데이터 가져옴:", freshTasks);

      // ✅ 기존 tasks를 유지하면서 상태 변경된 movedTask 반영
      const updatedTasks = tasks.map(task =>
        task.id === movedTask.id ? { ...task, status: newMappedStatus } : task
      );

      // ✅ 기존 데이터를 유지하면서 최신 데이터와 병합
      const mergedTasks = freshTasks.map(task =>
        updatedTasks.find(updated => updated.id === task.id) || task
      );

      // ✅ 깊은 복사 후 상태 업데이트 (React가 변경을 감지하도록 강제)
      setTasks([...JSON.parse(JSON.stringify(mergedTasks))]);  // ✅ 칸반 보드 업데이트
      setSchedules([...JSON.parse(JSON.stringify(mergedTasks))]);  // ✅ 캘린더 업데이트
      setGanttTasks([...JSON.parse(JSON.stringify(mergedTasks))]); // ✅ 간트차트 업데이트

      console.log("📌 캘린더 & 간트차트 데이터 강제 업데이트 완료!", mergedTasks);

      onKanbanUpdated(); // ✅ 상위 컴포넌트에서 리렌더링 실행

    } catch (error) {
      console.error(`❌ 상태 변경 실패 (${movedTask.id} → ${newMappedStatus}):`, error);

      // ❌ API 실패 시 이전 상태로 롤백
      setTasks(prevTasks);
    }
  };

  return (
    <KanbanWrapper>
      {/* <h2>📌 칸반 보드 (wsId: {wsId})</h2> */}
      <Typography variant="h2" sx={{ textAlign: "center", mb: 2 }}>📌 칸반 보드</Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" justifyContent="space-around">
          {Object.entries(columns).map(([columnId, columnTitle]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    width: "250px",
                    minHeight: "400px",
                    padding: "10px",
                    backgroundColor: columnColors[columnId],
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      marginBottom: "20px",
                      marginTop: "5px",
                    }}
                  >
                    {columnTitle}
                  </Typography>
                  {tasks
                    .filter((task) => {
                      // console.log(`🧐 필터링: task.status = "${task.status}", columnId = "${columnId}"`);
                      return task.status.trim() === columnId.trim();
                    })
                    .map((task, taskIndex) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={taskIndex}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              marginBottom: "10px",
                              padding: "10px",
                              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px"
                            }}
                          >
                            {task.extendedProps?.profileImage && (
                              <Avatar
                                src={task.extendedProps.profileImage}
                                alt={task.extendedProps.nickname || "담당자 없음"}
                                sx={{
                                  width: "30px",
                                  height: "30px",
                                }}
                              />
                            )}
                            <Typography>{task.title}</Typography>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>
    </KanbanWrapper>
  );
};

export default KanbanBoard;
