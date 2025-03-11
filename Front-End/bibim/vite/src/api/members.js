import axios from 'axios';

// 백엔드 API 기본 URL 설정
const API_BASE_URL = "http://localhost:8080"; // 백엔드 API 기본 URL

// auth.js에서 default export가 없으므로 직접 axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// 요청 시 자동으로 JWT 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ **비밀번호 변경 메일 전송**
export const sendChangePasswordMail = async (email) => {
    try {
        const response = await api.post(`/members/change-password?email=${email}`);
        console.log("✅ 비밀번호 변경 메일 전송 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 비밀번호 변경 메일 전송 실패:", error.response?.data?.message || error.message);
        throw error.response?.data || "비밀번호 변경 메일 전송 실패";
    }
};

// ✅ **비밀번호 변경**
export const changePassword = async (changePasswordData) => {
    try {
        const response = await api.put("/members/change-password", changePasswordData);
        console.log("✅ 비밀번호 변경 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 비밀번호 변경 실패:", error.response?.data?.message || error.message);
        throw error.response?.data || "비밀번호 변경 실패";
    }
};

// ✅ **회원 정보 수정하기**
export const updateUserInfo = async (formData, file) => {
    try {
        const token = localStorage.getItem("token");
        const form = new FormData();

        // JSON 데이터를 Blob으로 변환 후 FormData에 추가
        const jsonBlob = new Blob([JSON.stringify(formData)], {
            type: "application/json",
        });
        form.append("info", jsonBlob);

        // 이미지 파일이 있으면 추가
        if (file) {
            form.append("file", file);
        }

        // 📌 API 요청
        const response = await api.put("/members/changeinfo", form, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("✅ updateUserInfo 응답 데이터:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ updateUserInfo 오류:", error);
        throw error.response?.data || "회원 정보 수정 실패";
    }
};

// 회원 탈퇴 API 호출 함수
export const withdrawMember = async (password) => {
    try {
        const response = await api.delete("/members/withdraw", {
            data: { password }
        });
        console.log("✅ 회원 탈퇴 성공:", response.data.message);
        return response.data;
    } catch (error) {
        console.error("❌ 회원 탈퇴 실패:", error.response?.data?.message || error.message);
        throw error.response?.data || "회원 탈퇴 실패";
    }
};