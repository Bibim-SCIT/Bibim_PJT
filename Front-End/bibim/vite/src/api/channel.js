import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 API 기본 URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// ✅ 요청 시 자동으로 JWT 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ 워크스페이스 내 채널 목록 조회 API
export const getWorkspaceChannels = async (workspaceId) => {
    try {
        console.log(`🔵 워크스페이스 채널 조회 요청: /workspace/${workspaceId}/channel`);
        const response = await api.get(`/workspace/${workspaceId}/channel`);
        console.log("채널 api", response);
        return response.data; // 채널 리스트 반환
    } catch (error) {
        console.error("❌ 워크스페이스 채널 조회 오류:", error.response?.data || error);
        throw error.response?.data || error.message;
    }
};

// ✅ 요청 시 자동으로 JWT 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
