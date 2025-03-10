/* eslint-disable prettier/prettier */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 API 기본 URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// ✅ `api`를 export 추가
export { api };

// ✅ 요청 시 자동으로 JWT 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        // console.log("🟢 API 요청에 JWT 포함됨:", token); // ✅ 확인용 로그 추가
        config.headers.Authorization = `Bearer ${token}`;
        // console.log("🟢 API 요청에 JWT 포함됨2:", config.headers.Authorization);
    } else {
        console.warn("⚠️ API 요청 시 JWT 없음");
    }
    return config;
});

// 이메일 중복 확인
export const checkEmail = async (email) => {
    try {
        const response = await api.get("/members/check-email", {
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
        const response = await api.post("/members/signup/mail", null, {
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
        const response = await api.get("/members/signup/mail", {
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
        const response = await api.post("/members/signup", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("회원가입 요청 오류:", error.response?.data || error);
        throw error.response?.data || "회원가입 요청 오류";
    }
};

// 로그인 요청
export const loginUser = async (email, password) => {
    try {
        const response = await api.post("/members/login", { email, password });

        const { data } = response.data; // ✅ 응답에서 data 객체 추출
        const { accessToken } = data; // ✅ accessToken 가져오기

        console.log("data: ", response);
        console.log("🟢 로그인 성공, 발급된 토큰:", accessToken);

        // ✅ JWT를 로컬스토리지에 저장
        localStorage.setItem("token", accessToken);

        // ✅ 모든 요청에 자동으로 JWT를 포함하도록 설정
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // ✅ 설정이 반영되었는지 콘솔 출력
        console.log("🟢 요청 헤더에 JWT 설정 완료:", api.defaults.headers.common["Authorization"]);

        // ✅ 로그인 성공 후 즉시 사용자 정보 요청
        const userInfo = await getUserInfo();
        return userInfo; // ✅ 사용자 정보 반환
    } catch (error) {
        console.error("❌ 로그인 오류:", error.response?.data || error);
        throw error.response?.data || "로그인 실패";
    }
};

// ✅ 로그아웃 기능 추가 (토큰 삭제)
export const logoutUser = async () => {
    try {
        await api.post("/members/logout");
    } catch (error) {
        console.error("❌ 로그아웃 오류:", error.response?.data || error);
    } finally {
        localStorage.removeItem("token"); // ✅ 로컬 스토리지에서 토큰 삭제
        localStorage.removeItem("activeWorkspace"); // ✅ activeWorkspace 초기화
        delete api.defaults.headers.common["Authorization"];
        console.log("🟢 로그아웃 완료: Authorization 헤더 및 activeWorkspace 삭제됨");
    }
};

// 사용자 정보 가져오기 
export const getUserInfo = async () => {
    try {
        const response = await api.get("/members/myinfo");
        console.log("📌 getUserInfo 응답 데이터:", response.data); // ✅ 데이터 확인용 로그
        return response.data.data;
    } catch (error) {
        console.error("❌ getUserInfo 오류:", error);
        throw error.response?.data || "회원 정보 조회 실패";
    }
};

// ✅ 워크스페이스 내 회원 정보 조회 API
export const getWorkspaceMemberInfo = async (wsId) => {
    try {
        const response = await api.get("/workspace/myinfo", {
            params: { wsId }
        });

        console.log("📌 getWorkspaceMemberInfo 응답 데이터:", response.data);
        return response.data.data; // 백엔드 응답 구조에 따라 .data.data 사용
    } catch (error) {
        console.error("❌ 워크스페이스 내 회원 정보 조회 오류:", error);
        throw error.response?.data || "워크스페이스 내 회원 정보 조회 실패";
    }
};


// ✅ 워크스페이스 내 프로필 수정 API
export const updateWorkspaceMemberInfo = async (wsId, updateInfo, file) => {
    try {
        const formData = new FormData();
        formData.append("wsId", wsId);
        formData.append("info", new Blob([JSON.stringify(updateInfo)], { type: "application/json" }));

        if (file) {
            formData.append("file", file);
        }

        const response = await api.put("/workspace/myinfo", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("🟢 워크스페이스 내 프로필 수정 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ 워크스페이스 내 프로필 수정 오류:", error.response?.data || error);
        throw error.response?.data || "워크스페이스 프로필 수정 실패";
    }
};

// 구글 로그인 전용 함수 추가
// 구글 로그인 요청 (googleData는 jwtDecode된 객체)
export const googleLoginUser = async (googleData) => {
    try {
        // 백엔드의 구글 로그인 엔드포인트로 POST 요청
        const response = await api.post("/oauth2/google", googleData);

        // 응답에서 accessToken 추출 (백엔드에서 로그인 후 토큰과 함께 사용자 정보가 없다면, 별도로 사용자 정보를 조회해야 합니다)
        const { data } = response.data;
        const { accessToken } = data;

        console.log("구글 로그인 성공, 발급된 토큰:", accessToken);

        // JWT를 로컬스토리지에 저장
        localStorage.setItem("token", accessToken);

        // 모든 요청에 자동으로 JWT를 포함하도록 설정
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        console.log("요청 헤더에 JWT 설정 완료:", api.defaults.headers.common["Authorization"]);

        // 로그인 성공 후 즉시 사용자 정보 요청
        const userInfo = await getUserInfo();
        return userInfo;
    } catch (error) {
        console.error("구글 로그인 오류:", error.response?.data || error);
        throw error.response?.data || "구글 로그인 실패";
    }
};

// 구글 계정 연동 요청 API (email과 linkYn을 쿼리 파라미터로 전송)
export const linkGoogleAccount = async (email, linkYn) => {
    try {
        const response = await api.post("/oauth2/link", null, { params: { email, linkYn } });
        console.log("구글 계정 연동 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("연동 요청 오류:", error.response?.data || error);
        throw error.response?.data || "연동 요청 오류";
    }
};
