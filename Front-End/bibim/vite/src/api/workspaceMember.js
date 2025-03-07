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

// ✅ [공통] 워크스페이스 멤버 목록 조회
export const fetchWorkspaceMembers = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchWorkspaceMembers: wsId가 없어서 요청을 중단합니다.");
    return [];
  }

  try {
    console.log(`📌 fetchWorkspaceMembers(${wsId}) API 요청 시작...`);
    const response = await api.get(`/workspace/members`, {
      params: { wsId },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("❌ fetchWorkspaceMembers API 요청 실패:", error.response?.data || error);
    throw error;
  }
};
