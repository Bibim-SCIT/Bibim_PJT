/* eslint-disable prettier/prettier */
import axios from "axios";

import { api } from "./auth"; // ✅ `auth.js`의 api 인스턴스를 가져옴

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; // 백엔드 API 기본 URL
console.log("✅ 현재 연결된 API 서버:", API_BASE_URL);
const API_BASE_URL2 = `${API_BASE_URL}/workspace`;

// ✅ 공통 헤더 생성 함수 (토큰 포함)
const getAuthHeaders = () => {
    const token = localStorage.getItem("token"); // ✅ `auth.js`에서 저장한 키와 일치시킴
    if (!token) {
        console.error("🚨 JWT 토큰 없음! 로그인 필요");
        throw new Error("JWT 토큰이 없습니다. 다시 로그인하세요.");
    }
    return {
        Authorization: `Bearer ${token}`
    };
};


// ✅ 워크스페이스 리스트 가져오기
export const getWorkspaces = async () => {
    try {
        console.log("✅ 현재 연결된 API 서버:", API_BASE_URL);
        const response = await api.get(API_BASE_URL2);
        return response.data;
    } catch (error) {
        throw error.response?.data || "워크스페이스 목록을 불러오는데 실패했습니다.";
    }
};

// ✅ 워크스페이스 생성 요청
export const createWorkspace = async (workspaceName, workspaceImage = null) => {
    try {
        const formData = new FormData();
        formData.append("wsName", workspaceName); // ✅ 백엔드 DTO와 맞춤
        if (workspaceImage) {
            formData.append("file", workspaceImage);
        }

        console.log("📌 워크스페이스 생성 요청 FormData:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const response = await api.post("/workspace", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("token")}` // ✅ 직접 추가
            }
        });



        return response.data;

    } catch (error) {
        console.error("🚨 워크스페이스 생성 실패:", error);
        throw error.response?.data || "워크스페이스 생성에 실패했습니다.";
    }
};



// ✅ 초대 코드로 워크스페이스 가입
// 초대 코드에 의해 가입하기
export const joinWorkspaceByInviteCode = async (inviteCode) => {
    try {
        const response = await api.post(`${API_BASE_URL2}/add`, null, {
            params: { code: inviteCode },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "초대 코드 가입에 실패했습니다.";
    }
};


// ✅ 워크스페이스 삭제
// export const deleteWorkspace = async (workspaceName) => {
//     try {
//         const response = await axios.delete(`${API_BASE_URL}`, {
//             headers: getAuthHeaders(),
//             params: { wsName: workspaceName }
//         });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "워크스페이스 삭제에 실패했습니다.";
//     }
// };
// export const deleteWorkspace = async (workspaceName) => {
//     try {
//         const response = await axiosInstance.delete("", {
//             params: { wsName: workspaceName }
//         });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "워크스페이스 삭제에 실패했습니다.";
//     }
// };
export const deleteWorkspace = async (workspaceName) => {
    try {
        const response = await api.delete(API_BASE_URL2, {
            params: { wsName: workspaceName }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "워크스페이스 삭제에 실패했습니다.";
    }
};

// ✅ 현재 워크스페이스 멤버 정보 조회
export const getWorkspaceMembers = async (workspaceId) => {
    try {
        const response = await api.get(`${API_BASE_URL2}/myinfo`, {
            params: { wsId: workspaceId }
        });
        console.log('API 응답:', response);  // 응답 확인
        return response.data;
    } catch (error) {
        throw error.response?.data || "워크스페이스 멤버 정보를 불러오는데 실패했습니다.";
    }
};

export const updateWorkspace = async (wsName, newName, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('wsName', wsName);
        formData.append('newName', newName);
        if (imageFile) {
            formData.append('file', imageFile);
        }

        const response = await api.put('/workspace', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // 응답 데이터 확인 - 성공 응답 처리 수정
        // 백엔드에서 성공 응답을 다양한 형태로 보낼 수 있으므로 유연하게 처리
        if (response.data) {
            return response.data;
        }

        return { success: true, message: "워크스페이스 업데이트에 성공했습니다." };
    } catch (error) {
        console.error("🚨 워크스페이스 업데이트 실패:", error);
        throw new Error(error.response?.data?.message || "워크스페이스 업데이트에 실패했습니다.");
    }
};

// 초대 기능 API 호출
export const inviteWorkspace = async (wsId, email) => {
    try {
        const response = await api.post(`${API_BASE_URL2}/invite`, null, {
            params: { wsId, email },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "워크스페이스 초대에 실패했습니다.";
    }
};

export const kickUserFromWorkspace = async (wsId, email) => {
    try {
        console.log('강퇴 요청 파라미터:', { wsId, email });  // 요청 파라미터 확인
        const response = await api.delete(`${API_BASE_URL2}/forcedrawal`, {
            params: { wsId, email }
        });
        console.log('강퇴 API 응답:', response);  // API 응답 확인
        return response.data;
    } catch (error) {
        console.error('강퇴 API 에러:', error);  // 에러 상세 확인
        throw error.response?.data || "사용자 강퇴에 실패했습니다.";
    }
};

// 워크스페이스 내 모든 멤버 조회 API 호출 함수
export const fetchWorkspaceUsers = async (workspaceId) => {
    try {
        // workspaceId가 없으면 API 호출하지 않음
        if (!workspaceId) {
            console.error("🚨 workspaceId가 없어 API 호출을 중단합니다.");
            return [];
        }

        const response = await api.get(`${API_BASE_URL2}/${workspaceId}/members`, {
            headers: getAuthHeaders(),
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        console.error('워크스페이스 멤버 조회 실패:', error);
        return []; // 오류 발생 시 빈 배열 반환
    }
};

// 워크스페이스 멤버 권한 변경 API
export const updateUserRole = async (wsId, email, newRole) => {
    try {
        const response = await api.patch(`${API_BASE_URL2}/rolesetting`, null, {
            params: { wsId, email, newRole },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 응답 데이터 확인 로깅
        console.log('권한 변경 응답:', response);

        return response.data;
    } catch (error) {
        console.error('권한 변경 API 에러:', error);
        throw error.response?.data || "권한 변경에 실패했습니다.";
    }
};

// 워크스페이스 멤버 접속 현황 조회 API
export const fetchWorkspaceMembersStatus = async (workspaceId) => {
    try {
        if (!workspaceId) {
            console.error("🚨 workspaceId가 없어 API 호출을 중단합니다.");
            return [];
        }

        const response = await axios.get(`${API_BASE_URL2}/${workspaceId}/members/status`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
        });

        if (!response.data || !response.data.data) {
            console.error("🚨 API 응답에 data 필드가 없습니다");
            return [];
        }

        // 응답 데이터 형식 확인
        const statusData = response.data.data;

        // 데이터 형식 변환 (loginStatus -> status)
        const formattedData = statusData.map(item => ({
            email: item.email,
            status: item.loginStatus ? 'online' : 'offline',
            lastActiveTime: item.lastActiveTime
        }));

        return formattedData;
    } catch (error) {
        console.error("🚨 워크스페이스 멤버 접속 현황 조회 실패:", error);
        return [];
    }
};

/**
 * 워크스페이스 탈퇴 API
 * @param {number} wsId - 탈퇴할 워크스페이스 ID
 * @returns {Promise<Object>} 탈퇴 결과
 */
export const leaveWorkspace = async (wsId) => {
    try {
        const response = await api.delete('/workspace/withdrawal', {
            params: { wsId }
        });

        console.log('워크스페이스 탈퇴 응답:', response.data);  // 응답 확인
        return response.data;
    } catch (error) {
        console.error('워크스페이스 탈퇴 중 오류 발생:', error);
        console.error('오류 응답:', error.response?.data);  // 오류 응답 데이터 확인
        throw error.response?.data || "워크스페이스 탈퇴에 실패했습니다.";
    }
};

export default {
    getWorkspaces,
    createWorkspace,
    joinWorkspaceByInviteCode,
    deleteWorkspace,
    getWorkspaceMembers,
    inviteWorkspace
};
