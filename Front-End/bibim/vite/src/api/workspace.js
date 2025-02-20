import axios from "axios";

//const API_BASE_URL = "http://your-api-url.com/members"; // 백엔드 API 기본 URL
const API_BASE_URL = "http://localhost:8080/workspace"; // 백엔드 API 기본 URL

// 워크스페이스 리스트 가져오기
export const workspaceList = async (email) => {
    try {
        const response = await axios.get(`${API_BASE_URL}`, {
            params: { email },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "이메일 중복 확인 오류";
    }
};