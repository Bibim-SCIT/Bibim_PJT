import React, { useEffect, useState } from "react";
import { Box, Card, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchKanbanTasks, updateKanbanTaskStatus } from "../../../api/schedule";

const KanbanWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
});

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
        console.log("📌 변환된 칸반 보드 데이터:", data);
        setTasks(data);
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

    const newStatus = result.destination.droppableId;
    movedTask.status = newStatus;
    newTasks.splice(result.destination.index, 0, movedTask);

    setTasks(newTasks);

    try {
      await updateKanbanTaskStatus(movedTask.id, newStatus);
      console.log(`✅ ${movedTask.id} 상태 변경 완료 (${newStatus})`);
    } catch (error) {
      console.error(`❌ 상태 변경 실패 (${movedTask.id} → ${newStatus}):`, error);
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
                  {tasks.filter((task) => task.status === columnId).map((task, taskIndex) => (
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
