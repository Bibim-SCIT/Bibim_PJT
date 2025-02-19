import axios from "axios";

//const API_BASE_URL = "http://your-api-url.com/members"; // 백엔드 API 기본 URL
const API_BASE_URL = "http://localhost:8080"; // 백엔드 API 기본 URL

// 이메일 중복 확인
export const checkEmail = async (email) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/check-email`, {
            params: { email },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "이메일 중복 확인 오류";
    }
};

// 이메일 인증 요청
export const sendVerificationEmail = async (email) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup/send-mail`, null, {
            params: { email },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "이메일 인증 요청 오류";
    }
};

// 이메일 인증 코드 확인
export const verifyEmailCode = async (email, code) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/signup/check-mail`, {
            data: { email, code },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "인증 코드 확인 오류";
    }
};

// 회원가입 요청
export const registerUser = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/members/signup`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("회원가입 요청 오류:", error.response?.data || error);
        throw error.response?.data || "회원가입 요청 오류";
    }
};

