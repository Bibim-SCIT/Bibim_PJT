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
    formData.append('wsId', wsId.toString());  // ✅ 숫자인 경우 문자열로 변환
    formData.append('title', title);
    formData.append('content', content);

    // if (files.length > 0) {
    //     files.forEach(file => formData.append('files', file)); // 다중 파일 처리
    // }

    // ✅ 파일 데이터 추가 (배열로 올바르게 추가되는지 확인)
    if (files.length > 0) {
        files.forEach((file, index) => {
            formData.append(`files`, file); // 🔥 files[]로 보내지 않도록 단일 키 사용
        });
    }

    if (tags.length > 0) {
        tags.forEach(tag => formData.append('tags', tag));
    }

    // 🔥 디버깅: FormData에 담긴 데이터 확인
    console.log("🔵 FormData 확인:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
        const response = await api.post('/workdata', formData, {
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
        const response = await api.delete('/workdata', { params: { wsId, dataNumber } });
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
// export const updateWorkdata = async (wsId, dataNumber, title, content, deleteFiles, tagRequests, newFiles) => {
//     const formData = new FormData();
//     formData.append('wsId', wsId);
//     formData.append('dataNumber', dataNumber);
//     if (title) formData.append('title', title);
//     if (content) formData.append('content', content);
//     formData.append('deleteFiles', JSON.stringify(deleteFiles));
//     formData.append('tagRequests', JSON.stringify(tagRequests));
//     newFiles.forEach(file => formData.append('files', file));

//     try {
//         const response = await api.put('/workdata', formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || error.message;
//     }
// };
export const updateWorkdata = async (wsId, dataNumber, title, content, deleteFiles, deletedTags, newTags, newFiles) => {
    const formData = new FormData();
    formData.append('wsId', wsId);
    formData.append('dataNumber', dataNumber);
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);
    formData.append('deleteFiles', JSON.stringify(deleteFiles));

    // ✅ `deleteTags`와 `newTags`를 백엔드가 요구하는 형식으로 전달
    deletedTags.forEach(tag => formData.append('deleteTags', tag));
    newTags.forEach(tag => formData.append('newTags', tag));

    newFiles.forEach(file => formData.append('files', file));

    // 🔵 디버깅: 전송할 FormData 출력
    console.log("📌 updateWorkdata 전송 데이터:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    try {
        const response = await api.put('/workdata', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("❌ updateWorkdata 오류:", error.response?.data || error);
        throw error.response?.data || error.message;
    }
};


// 자료 목록 조회 API
// export const getWorkdataList = async (wsId) => {
//     try {
//         const response = await api.get('/workdata', { params: { wsId } });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || error.message;
//     }
// };

// 자료 상세 조회 API
// export const getWorkdataDetail = async (wsId, dataNumber) => {
//     try {
//         const response = await api.get('/workdata/detail', { params: { wsId, dataNumber } });
//         return response.data;
//     } catch (error) {
//         throw error.response?.data || error.message;
//     }
// };

// ✅ 자료실 전체 조회 API
export const getWorkdataList = async (wsId, sort = "regDate", order = "desc") => {
    try {
        const response = await api.get('/workdata', { params: { wsId, sort, order } });
        return response.data.data; // ✅ 백엔드에서 받은 'data' 부분만 반환
    } catch (error) {
        throw error.response?.data || "자료 목록 조회 실패";
    }
};


// ✅ 자료실 상세 조회 API
export const getWorkdataDetail = async (wsId, dataNumber) => {
    try {
        const response = await api.get('/workdata/detail', { params: { wsId, dataNumber } });
        return response.data.data; // ✅ 백엔드에서 받은 'data' 부분만 반환
    } catch (error) {
        throw error.response?.data || "자료 상세 조회 실패";
    }
};


// 자료 검색 API
export const searchWorkdata = async (wsId, keyword) => {
    try {
        const response = await api.get('/workdata/search', { params: { wsId, keyword } });
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

