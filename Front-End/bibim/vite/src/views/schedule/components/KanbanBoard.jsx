import React, { useEffect, useState } from "react";
import { Box, Card, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchKanbanTasks, updateKanbanTaskStatus, assignSchedule } from "../../../api/schedule";

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

const KanbanBoard = ({ wsId }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
  const loadTasks = async () => {
    try {
      const data = await fetchKanbanTasks(wsId);
      console.log("📌 원본 API 응답 데이터:", data); // 🟢 API 데이터 그대로 출력

      // ✅ 불필요한 상태 변환 제거 (그대로 사용)
      setTasks(data);

      console.log("✅ 최종적으로 적용된 tasks:", data);
    } catch (error) {
      console.error("❌ 칸반 보드 데이터 로드 실패:", error);
    }
  };

  loadTasks();
}, [wsId]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(result.source.index, 1);
    const newStatusKey = result.destination.droppableId; // ✅ 'inProgress' 등 문자열로 받아옴

    try {
      // ✅ 담당자가 없고, "진행중 (inProgress)"으로 이동하는 경우, 먼저 assignSchedule 실행
      if (movedTask.status === "unassigned" && newStatusKey === "inProgress") {
        await assignSchedule(movedTask.id);
      }

      // ✅ 상태 변경 API 요청
      await updateKanbanTaskStatus(movedTask.id, newStatusKey); // ✅ 문자열(`inProgress`)로 전달

      // ✅ UI 업데이트
      movedTask.status = newStatusKey;
      newTasks.splice(result.destination.index, 0, movedTask);
      setTasks(newTasks);

      console.log(`✅ ${movedTask.id} 상태 변경 완료 (${newStatusKey})`);
    } catch (error) {
      console.error(`❌ 상태 변경 실패 (${movedTask.id} → ${newStatusKey}):`, error);
    }
  };

  return (
    <KanbanWrapper>
      <h2>📌 칸반 보드 (wsId: {wsId})</h2>
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
                    backgroundColor: "#f4f4f4",
                    borderRadius: "8px",
                  }}
                >
                  <Typography variant="h6" align="center" gutterBottom>
                    {columnTitle}
                  </Typography>
                  {tasks
  .filter((task) => {
    console.log(`🧐 필터링: task.status = "${task.status}", columnId = "${columnId}"`);
    return task.status.trim() === columnId.trim();
  })
  .map((task, taskIndex) => (
    <Draggable key={task.id} draggableId={task.id.toString()} index={taskIndex}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ marginBottom: "10px", padding: "10px" }}
        >
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
