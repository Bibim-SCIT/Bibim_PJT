import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Gantt } from "gantt-task-react"; // ✅ Task 제거
import "gantt-task-react/dist/index.css";
import { fetchScheduleTasks } from "../../../../api/schedule"; // ✅ API 모듈 사용

const GanttWrapper = styled(Box)({
  padding: "20px",
  background: "#fff",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
});

const GanttChart = ({ wsId }) => {
  const [tasks, setTasks] = useState([]);

  // 성준 작성 코드 (src/api/schedule.js에서 import)
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchScheduleTasks(wsId);
        console.log("📌 변환된 간트 차트 데이터:", data);
        setTasks(data);
      } catch (error) {
        console.error("❌ 간트 차트 데이터 로드 실패:", error);
      }
    };

    loadTasks();
  }, [wsId]);

  return (
    <GanttWrapper>
      <h2>📅 간트 차트 (wsId: {wsId})</h2>
      {tasks.length > 0 ? (
        <Gantt tasks={tasks} />
      ) : (
        <p>⏳ 등록된 작업이 없습니다.</p>
      )}
    </GanttWrapper>
  );
};

export default GanttChart;
