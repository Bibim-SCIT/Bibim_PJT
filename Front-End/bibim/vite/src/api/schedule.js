import axios from "axios";
import { api } from "./auth"; // ✅ 기존 API 인스턴스 사용

const getAxiosConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// ✅ 상태 코드 매핑 (프론트 → 백엔드)
const statusMapping = {
  unassigned: '1',
  inProgress: '2',
  completed: '3',
  backlog: '4'
};

// ✅ 상태 코드 매핑 (백엔드 → 프론트)
const statusMappingReverse = {
  '1': "unassigned",
  '2': "inProgress",
  '3': "completed",
  '4': "backlog",
};

// ✅ [공통] 칸반 보드 목록 조회
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
      start: task.scheduleStartDate ? new Date(task.scheduleStartDate) : null,
      end: task.scheduleFinishDate ? new Date(task.scheduleFinishDate) : null,
      status: statusMappingReverse[task.scheduleStatus] || "unassigned", // ✅ 숫자 → 텍스트 변환
      extendedProps: task,
    }));
  } catch (error) {
    console.error("❌ fetchKanbanTasks API 요청 실패:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 스케줄 목록 조회 (캘린더, 간트차트용)
export const fetchScheduleTasks = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchScheduleTasks: wsId가 없어서 요청을 중단합니다.");
    return [];
  }

  try {
    console.log(`📌 fetchScheduleTasks(${wsId}) API 요청 시작...`);

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
      start: task.scheduleStartDate ? new Date(task.scheduleStartDate) : null,
      end: task.scheduleFinishDate ? new Date(task.scheduleFinishDate) : null,
      status: task.scheduleStatus || "unassigned", // ✅ 숫자 → 텍스트 변환
      extendedProps: task,
    }));
  } catch (error) {
    console.error("❌ fetchScheduleTasks API 요청 실패:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 단일 스케줄 조회
export const getSchedule = async (scheduleNumber) => {
  const response = await api.get(`/schedule/${scheduleNumber}`, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 스케줄 생성
export const createSchedule = async (scheduleData) => {
  const response = await api.post(`/schedule`, scheduleData, getAxiosConfig());
  return response.data;
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

// ✅ [공통] 스케줄 삭제
export const deleteSchedule = async (scheduleNumber) => {
  const response = await api.delete(`/schedule/${scheduleNumber}`, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 스케줄 담당자 지정 (추가)
export const assignSchedule = async (scheduleNumber) => {
  if (!scheduleNumber) {
    console.warn("🚨 assignSchedule: 잘못된 입력 값 (scheduleNumber)");
    return;
  }

  try {
    console.log(`📌 assignSchedule(${scheduleNumber}) 요청`);

    await api.put(`/schedule/${scheduleNumber}/assignees`, {}, getAxiosConfig());

    console.log(`✅ ${scheduleNumber} 스케줄 담당자 지정 완료`);
  } catch (error) {
    console.error(`❌ ${scheduleNumber} 스케줄 담당자 지정 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 칸반 보드 상태 변경
export const updateKanbanTaskStatus = async (taskId, newStatus) => {
  if (!taskId || !newStatus) {
    console.warn("🚨 updateKanbanTaskStatus: 잘못된 입력 값 (taskId, newStatus)");
    return;
  }

  const statusCode = statusMapping[newStatus]; // ✅ 변환된 값 사용
  if (!statusCode) {
    console.error(`❌ updateKanbanTaskStatus: 잘못된 상태 값 (${newStatus})`);
    return;
  }

  try {
    console.log(`📌 updateKanbanTaskStatus(${taskId}) → ${statusCode} 요청`);

    // ✅ params 옵션을 사용하여 상태 값을 전송 (쿼리 파라미터 방식 수정)
    await api.put(`/schedule/${taskId}/status`, null, {
      params: { status: statusCode },
      ...getAxiosConfig(),
    });

    console.log(`✅ ${taskId} 상태 변경 완료 (${newStatus})`);
  } catch (error) {
    console.error(`❌ ${taskId} 상태 변경 실패 (${newStatus}):`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 수정된 `fetchKanbanTasks`로 변경
export default {
  fetchKanbanTasks,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  assignSchedule,
  updateKanbanTaskStatus, // ✅ 칸반 보드 상태 업데이트 추가
};
