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

  // 진환 작성 코드
  // useEffect(() => {
  //   fetch("http://localhost:8080/schedule?wsId=9", {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": "Bearer " + localStorage.getItem("token"),
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log("API 응답 데이터:", data);

  //       // ✅ 데이터가 존재하는지 확인
  //       if (!data || !data.data) {
  //         console.error("올바르지 않은 데이터 구조:", data);
  //         return;
  //       }

  //       // ✅ `start`와 `end`가 없는 경우 필터링
  //       const formattedTasks = data.data
  //         .filter((task) => task.scheduleStartDate && task.scheduleFinishDate)
  //         .map((task) => ({
  //           id: task.scheduleNumber || Math.random().toString(),
  //           name: task.scheduleTitle || "제목 없음",
  //           start: new Date(task.scheduleStartDate),
  //           end: new Date(task.scheduleFinishDate),
  //           type: "task",
  //           progress: 0,
  //           isDisabled: false,
  //           styles: { backgroundColor: task.color || "#DBE2EF" },
  //         }));

  //       console.log("📌 변환된 간트 차트 데이터:", formattedTasks);
  //       setTasks(formattedTasks);
  //     })
  //     .catch((err) => console.error("Error fetching tasks:", err));
  // }, [wsId]);

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
