import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 API 기본 URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// ✅ 현재 접속자 정보 가져오기
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/members/myinfo'); // ✅ 기존 auth.js의 getUserInfo와 동일
        return response.data.data; // user 정보 반환
    } catch (error) {
        throw error.response?.data || "사용자 정보 조회 실패";
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

// 자료 등록 API
export const createWorkdata = async (wsId, title, content, files, tags) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    if (files.length > 0) {
        files.forEach(file => formData.append('files', file));
    }

    if (tags.length > 0) {
        tags.forEach(tag => formData.append('tags', tag));
    }

    console.log("🔵 FormData 확인:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
        console.log("🟢 업로드 요청 데이터:", { wsId, title, content, tags, files });

        const response = await api.post(`/workdata/${wsId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("❌ createWorkdata 오류:", error.response?.data || error);
        throw error.response?.data || error.message;
    }
};



// 자료 삭제 API
export const deleteWorkdata = async (wsId, dataNumber) => {
    try {
        const response = await api.delete(`/workdata/${wsId}/${dataNumber}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


// 태그 삭제 API
export const deleteTag = async (wsId, dataNumber, tag) => {
    try {
        const response = await api.delete('/workdata/file/tag', {
            params: { wsId, dataNumber },
            data: { tag },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 자료 수정 API
export const updateWorkdata = async (wsId, dataNumber, title, content, deleteFiles, deletedTags, newTags, newFiles) => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);
    formData.append('deleteFiles', JSON.stringify(deleteFiles));

    // 🔹 삭제된 태그와 추가된 태그를 JSON 문자열로 변환하여 전달
    formData.append('deleteTags', JSON.stringify(deletedTags));
    formData.append('newTags', JSON.stringify(newTags));
    newFiles.forEach(file => formData.append('files', file));

    console.log("📌 updateWorkdata 전송 데이터:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
        const response = await api.put(`/workdata/${wsId}/${dataNumber}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("❌ updateWorkdata 오류:", error.response?.data || error);
        throw error.response?.data || error.message;
    }
};

// ✅ 자료실 전체 조회 API
export const getWorkdataList = async (wsId, sort = "regDate", order = "desc") => {
    try {
        const response = await api.get(`/workdata/${wsId}`, { params: { sort, order } });
        return response.data.data;
    } catch (error) {
        throw error.response?.data || "자료 목록 조회 실패";
    }
};

// ✅ 자료실 상세 조회 API
export const getWorkdataDetail = async (wsId, dataNumber) => {
    try {
        const response = await api.get(`/workdata/detail/${wsId}/${dataNumber}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || "자료 상세 조회 실패";
    }
};

// 자료 검색 API
export const searchWorkdata = async (wsId, keyword) => {
    try {
        const response = await api.get(`/workdata/search/${wsId}`, { params: { keyword } });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 자료 정렬 API
export const getSortedWorkdata = async (wsId, sortField, sortOrder) => {
    try {
        const response = await api.get('/workdata/sort', { params: { wsId, sortField, sortOrder } });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

