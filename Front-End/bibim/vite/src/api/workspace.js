import axios from "axios";

//const API_BASE_URL = "http://your-api-url.com/members"; // 백엔드 API 기본 URL
const API_BASE_URL = "http://localhost:8080/workspace"; // 백엔드 API 기본 URL

// 워크스페이스 리스트 가져오기
export const workspaceList = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}`, {
            headers : {Authorization: `Bearer ${token}`},
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "토큰 정보가 제대로 맞지 않음";
    }
};