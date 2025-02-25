import axios from 'axios';

// 프로필 조회
export const fetchProfileData = async () => {
    try {
        const response = await axios.get('/api/members/profile');
        return response.data;  // 데이터만 반환
    } catch (error) {
        throw error;  // 에러 처리는 호출하는 쪽에서
    }
};

// 프로필 업데이트
export const updateProfile = async (formData, profileImage) => {
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('info', JSON.stringify(formData));
        if (profileImage instanceof File) {
            formDataToSend.append('file', profileImage);
        }
        const response = await axios.put('/api/members/update', formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post('/api/members/profile-image', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 프로필 이미지 삭제
export const deleteProfileImage = async () => {
    try {
        await axios.delete('/api/members/profile-image');
    } catch (error) {
        throw error;
    }
}; 