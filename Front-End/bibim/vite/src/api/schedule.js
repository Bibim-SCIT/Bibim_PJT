import { api } from "./auth"; // ✅ Vite 프록시 적용한 공통 API 인스턴스 사용

const getAxiosConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// ✅ [공통] 칸반 보드 및 캘린더 작업 목록 조회
export const fetchKanbanTasks = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchKanbanTasks: wsId가 없어서 요청을 중단합니다.");
    return [];
  }

  try {
    console.log(`📌 fetchKanbanTasks(${wsId}) API 요청 시작...`);

    const response = await api.get("/schedule", {
      params: { wsId },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);

    if (!response.data || !response.data.data) {
      console.error("❌ 올바르지 않은 데이터 구조:", response.data);
      return [];
    }

    return response.data.data.map((task) => ({
      id: task.scheduleNumber,
      title: task.scheduleTitle || "제목 없음",
      start: task.scheduleStartDate ? new Date(task.scheduleStartDate).toISOString() : null,
      end: task.scheduleFinishDate ? new Date(task.scheduleFinishDate).toISOString() : null,
      status: task.scheduleStatus ? task.scheduleStatus.toLowerCase() : "unassigned",
      extendedProps: task
    }));
  } catch (error) {
    console.error("❌ fetchKanbanTasks API 요청 실패:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 스케줄 수정 (PUT 요청)
export const updateSchedule = async (scheduleId, updatedData) => {
  if (!scheduleId || !updatedData) {
    console.warn("🚨 updateSchedule: 잘못된 입력 값 (scheduleId, updatedData)");
    return;
  }

  try {
    console.log(`📌 updateSchedule(${scheduleId}) 요청 데이터:`, updatedData);

    await api.put(`/schedule/${scheduleId}`, updatedData, getAxiosConfig());

    console.log(`✅ ${scheduleId} 스케줄 수정 완료`);
  } catch (error) {
    console.error(`❌ ${scheduleId} 스케줄 수정 실패:`, error.response?.data || error.message);
    throw error;
  }
};
