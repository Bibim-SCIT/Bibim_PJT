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

// ✅ [공통] 스케줄 목록 조회 (간트 차트 & 캘린더에서 사용)
export const fetchScheduleTasks = async (wsId) => {
  try {
    const response = await api.get(`/schedule`, {
      params: { wsId },
    });

    console.log("📌 API 응답 데이터:", response.data);

    if (!response.data || !response.data.data) {
      console.error("올바르지 않은 데이터 구조:", response.data);
      return [];
    }

    return response.data.data.map((task) => ({
      id: task.scheduleNumber || Math.random().toString(),
      name: task.scheduleTitle || "제목 없음",
      title: task.scheduleTitle || "제목 없음", // ✅ 캘린더용 title 추가
      start: new Date(task.scheduleStartDate),
      end: new Date(task.scheduleFinishDate),
      allDay: true, // ✅ 캘린더용 추가 필드
      type: "task",
      progress: 0,
      isDisabled: false,
      styles: { backgroundColor: task.color || "#DBE2EF" },
      extendedProps: { ...task }, // ✅ 모달에서 쓰기 위한 추가 데이터
    }));
  } catch (error) {
    console.error("❌ 스케줄 데이터 가져오기 오류:", error.response?.data || error);
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

// ✅ [공통] 스케줄 수정
export const updateSchedule = async (scheduleNumber, changeScheduleDTO) => {
  const response = await api.put(`/schedule/${scheduleNumber}`, changeScheduleDTO, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 스케줄 삭제
export const deleteSchedule = async (scheduleNumber) => {
  const response = await api.delete(`/schedule/${scheduleNumber}`, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 스케줄 담당자 지정
export const assignSchedule = async (scheduleNumber) => {
  const response = await api.put(`/schedule/${scheduleNumber}/assignees`, {}, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 스케줄 상태 변경
export const changeStatus = async (scheduleNumber, status) => {
  const response = await api.put(`/schedule/${scheduleNumber}/status?status=${status}`, {}, getAxiosConfig());
  return response.data;
};

export default {
  fetchScheduleTasks,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  assignSchedule,
  changeStatus,
};
