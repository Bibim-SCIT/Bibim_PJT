import React, { useEffect, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanWrapper = styled(Box)({
  padding: '20px',
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
});

const columns = {
  unassigned: "할 일",
  inProgress: "진행 중",
  completed: "완료",
  backlog: "보류"
};

const KanbanBoard = ({ wsId }) => {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    fetch("http://localhost:8080/schedule?wsId=9", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API 응답 데이터:", data);
        const formattedTasks = data.data.map(task => ({
          id: task.scheduleNumber,
          title: task.scheduleTitle,
          status: task.scheduleStatus.toLowerCase(),
        }));
        setTasks(formattedTasks);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, [wsId]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newTasks = Array.from(tasks);
    const [movedTask] = newTasks.splice(result.source.index, 1);
    movedTask.status = Object.keys(columns)[result.destination.droppableId];
    newTasks.splice(result.destination.index, 0, movedTask);
    setTasks(newTasks);
  };

  return (
    <KanbanWrapper>
      <h2>📌 칸반 보드 (wsId: {wsId})</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" justifyContent="space-around">
          {Object.entries(columns).map(([columnId, columnTitle], index) => (
            <Droppable key={columnId} droppableId={`${index}`}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ width: '250px', minHeight: '400px', padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    {columnTitle}
                  </Typography>
                  {tasks.filter(task => task.status === columnId).map((task, taskIndex) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={taskIndex}>
                      {(provided) => (
                        <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} sx={{ marginBottom: '10px', padding: '10px' }}>
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
