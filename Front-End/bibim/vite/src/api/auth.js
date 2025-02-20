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
        const response = await axios.post(`${API_BASE_URL}/members/signup/mail`, null, {
            params: { email },
        });

        console.log("📩 백엔드 응답:", response.data); // ✅ 응답 데이터 확인

        return response.data; // ✅ 백엔드 응답 구조에 맞게 반환
    } catch (error) {
        console.error("이메일 인증 요청 오류:", error.response?.data || error);
        throw error.response?.data || "이메일 인증 요청 오류";
    }
};


// 이메일 인증 코드 확인
export const verifyEmailCode = async (email, code) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/members/signup/mail`, {
            params: { email, code } // ✅ 백엔드 요구 사항에 맞게 GET 요청으로 전달
        });

        console.log("📩 인증 코드 검증 응답:", response.data); // ✅ 응답 확인용 로그 추가

        return response.data;
    } catch (error) {
        console.error("인증 코드 확인 오류:", error.response?.data || error);
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

