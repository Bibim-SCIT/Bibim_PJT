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

// ✅ [공통] 대분류 태그 가져오기 (원래대로 복구)
export const fetchLargeTags = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchLargeTags: wsId가 없어서 요청을 중단합니다.");
    return [];
  }

  try {
    console.log(`📌 fetchLargeTags(${wsId}) API 요청 시작...`);
    
    // ✅ `/api/` 제거 → 원래 백엔드 경로로 복구
    const response = await api.get("/schedule/tag/large", {
      params: { wsId },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ fetchLargeTags API 요청 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ [공통] 중분류 태그 가져오기 (원래대로 복구)
export const fetchMediumTags = async (wsId, largeTagNumber) => {
  if (!wsId || !largeTagNumber) {
    console.warn("🚨 fetchMediumTags: 필요한 파라미터(wsId, largeTagNumber)가 없습니다.");
    return [];
  }

  try {
    console.log(`📌 fetchMediumTags(wsId: ${wsId}, largeTagNumber: ${largeTagNumber}) API 요청 시작...`);
    
    const response = await api.get("/schedule/tag/medium", {
      params: { wsId, largeTagNumber },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ fetchMediumTags API 요청 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ [공통] 소분류 태그 가져오기 (원래대로 복구)
export const fetchSmallTags = async (wsId, largeTagNumber, mediumTagNumber) => {
  if (!wsId || !largeTagNumber || !mediumTagNumber) {
    console.warn("🚨 fetchSmallTags: 필요한 파라미터(wsId, largeTagNumber, mediumTagNumber)가 없습니다.");
    return [];
  }

  try {
    console.log(`📌 fetchSmallTags(wsId: ${wsId}, largeTagNumber: ${largeTagNumber}, mediumTagNumber: ${mediumTagNumber}) API 요청 시작...`);
    
    const response = await api.get("/schedule/tag/small", {
      params: { wsId, largeTagNumber, mediumTagNumber },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ fetchSmallTags API 요청 실패:", error.response?.data || error);
    throw error;
  }
};
