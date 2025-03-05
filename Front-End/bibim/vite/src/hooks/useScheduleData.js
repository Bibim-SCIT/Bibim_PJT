// import { useState, useCallback } from "react";
// import {
//   fetchScheduleTasks,
//   getSchedule,
//   createSchedule,
//   updateSchedule,
//   deleteSchedule,
//   assignSchedule,
//   changeStatus,
// } from "../api/schedule"; // ✅ 통합된 schedule.js 사용

// const useScheduleData = () => {
//   const [schedules, setSchedules] = useState([]);
//   const [currentSchedule, setCurrentSchedule] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchSchedules = useCallback(async (wsId) => {
//     if (!wsId) return;

//     setLoading(true);
//     try {
//       const data = await fetchScheduleTasks(wsId); // ✅ 간트 차트 API 방식 사용
//       setSchedules(data);
//       console.log("📅 변환된 스케줄 데이터:", data);
//     } catch (error) {
//       console.error("❌ 스케줄 목록 불러오기 실패:", error);
//       setError(error);
//       setSchedules([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return {
//     schedules,
//     currentSchedule,
//     loading,
//     error,
//     fetchSchedules,
//     fetchSchedule: getSchedule,
//     createSchedule,
//     updateSchedule,
//     deleteSchedule,
//     assignSchedule,
//     changeStatus,
//   };
// };

// export default useScheduleData;
