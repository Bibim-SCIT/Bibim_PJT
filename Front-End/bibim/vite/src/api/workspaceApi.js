/* eslint-disable prettier/prettier */
import axios from "axios";

import { api } from "./auth"; // ✅ `auth.js`의 api 인스턴스를 가져옴

const API_BASE_URL = "http://localhost:8080/workspace"; // 백엔드 API 기본 URL

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
// export const getWorkspaces = async () => {
//     try {
//         const response = await axios.get(`${API_BASE_URL}`, { headers: getAuthHeaders() });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "워크스페이스 목록을 불러오는데 실패했습니다.";
//     }
// };
// export const getWorkspaces = async () => {
//     try {
//         const response = await axiosInstance.get("");
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "워크스페이스 목록을 불러오는데 실패했습니다.";
//     }
// };
export const getWorkspaces = async () => {
    try {
        const response = await api.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || "워크스페이스 목록을 불러오는데 실패했습니다.";
    }
};

// ✅ 워크스페이스 생성 요청
// export const createWorkspace = async (workspaceName, workspaceImage = null) => {
//     try {
//         const formData = new FormData();
//         formData.append("name", workspaceName);
//         if (workspaceImage) {
//             formData.append("file", workspaceImage);
//         }

//         const response = await axios.post(`${API_BASE_URL}`, formData, {
//             headers: {
//                 ...getAuthHeaders(),
//                 "Content-Type": "multipart/form-data"
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error("🚨 워크스페이스 생성 실패:", error);
//         throw error.response?.data || "워크스페이스 생성에 실패했습니다.";
//     }
// };
// export const createWorkspace = async (workspaceName, workspaceImage = null) => {
//     try {
//         const formData = new FormData();
//         formData.append("name", workspaceName);
//         if (workspaceImage) {
//             formData.append("file", workspaceImage);
//         }

//         const response = await axiosInstance.post("", formData, {
//             headers: { "Content-Type": "multipart/form-data" }
//         });
//         return response.data;
//     } catch (error) {
//         console.error("🚨 워크스페이스 생성 실패:", error);
//         throw error.response?.data || "워크스페이스 생성에 실패했습니다.";
//     }
// };
// export const createWorkspace = async (workspaceName, workspaceImage = null) => {
//     try {
//         const formData = new FormData();
//         formData.append("name", workspaceName);
//         if (workspaceImage) {
//             formData.append("file", workspaceImage);
//         }

//         const response = await api.post(API_BASE_URL, formData, {
//             headers: { "Content-Type": "multipart/form-data" } // ✅ `api`는 이미 Authorization 헤더 포함
//         });
//         return response.data;
//     } catch (error) {
//         console.error("🚨 워크스페이스 생성 실패:", error);
//         throw error.response?.data || "워크스페이스 생성에 실패했습니다.";
//     }
// };
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

        // const response = await axios.get(`${API_BASE_URL}`, 
        // {
        //     // headers : {Authorization: `Bearer ${token}`},
        //     headers : {Authorization: `Bearer eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzQwNTQ0NDMzLCJleHAiOjE3NDA1NTE2MzN9.8-x4Gzupg2VqShiVOZmkH7t9aMBm-IPIvRsdX2SP0ZU`},
        // });
        // return response.data;
    } catch (error) {
        console.error("🚨 워크스페이스 생성 실패:", error);
        throw error.response?.data || "워크스페이스 생성에 실패했습니다.";
    }
};



// ✅ 초대 코드로 워크스페이스 가입
// export const joinWorkspaceByInviteCode = async (inviteCode) => {
//     try {
//         const response = await axios.post(
//             `${API_BASE_URL}/add`,
//             { inviteCode },
//             { headers: getAuthHeaders() }
//         );
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "초대 코드 가입에 실패했습니다.";
//     }
// };
// export const joinWorkspaceByInviteCode = async (inviteCode) => {
//     try {
//         const response = await axiosInstance.post("/add", { inviteCode });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "초대 코드 가입에 실패했습니다.";
//     }
// };
export const joinWorkspaceByInviteCode = async (inviteCode) => {
    try {
        const response = await api.post(`${API_BASE_URL}/add`, { inviteCode });
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
        const response = await api.delete(API_BASE_URL, {
            params: { wsName: workspaceName }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "워크스페이스 삭제에 실패했습니다.";
    }
};

// ✅ 현재 워크스페이스 멤버 정보 조회
// export const getWorkspaceMembers = async (workspaceId) => {
//     try {
//         const response = await axios.get(`${API_BASE_URL}/myinfo`, {
//             headers: getAuthHeaders(),
//             params: { wsId: workspaceId }
//         });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "워크스페이스 멤버 정보를 불러오는데 실패했습니다.";
//     }
// };
// export const getWorkspaceMembers = async (workspaceId) => {
//     try {
//         const response = await axiosInstance.get("/myinfo", {
//             params: { wsId: workspaceId }
//         });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || "워크스페이스 멤버 정보를 불러오는데 실패했습니다.";
//     }
// };
export const getWorkspaceMembers = async (workspaceId) => {
    try {
        const response = await api.get(`${API_BASE_URL}/myinfo`, {
            params: { wsId: workspaceId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "워크스페이스 멤버 정보를 불러오는데 실패했습니다.";
    }
};

export default {
    getWorkspaces,
    createWorkspace,
    joinWorkspaceByInviteCode,
    deleteWorkspace,
    getWorkspaceMembers
};
