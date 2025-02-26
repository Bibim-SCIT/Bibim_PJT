import axios from 'axios';

// 백엔드 API 기본 URL 설정
const API_BASE_URL = "http://localhost:8080"; // 백엔드 API 기본 URL

// 사용자 정보 가져오기 
export const fetchUserInfo = async (setUserInfo, setLoading, setError) => {
    try {
        setLoading(true);
        
        // 포스트맨에서 가져온 고정 토큰 사용
        const hardcodedToken =
          'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzQwNDcwNDMyLCJleHAiOjE3NDA0Nzc2MzJ9.4ERgQnvwmZZASCEqzVYh13BQc1feOrxg9c4DUuAorr0';
        
        try {
            const response = await axios.get(`${API_BASE_URL}/members/myinfo`, {
                headers: {
                    'Authorization': `Bearer ${hardcodedToken}`
                }
            });
            
            if (response.data && response.data.data) {
                // 백엔드 응답 구조에 맞게 수정
                if (response.data.data) {
                    setUserInfo(response.data.data);
                    setError(null);
                } else {
                    setError('회원 정보를 불러오는데 실패했습니다.');
                }
            } else {
                setError('회원 정보를 불러오는데 실패했습니다.');
            }
        } catch (apiError) {
            throw apiError; 
        }
    } catch (error) {
        setError('회원 정보를 불러오는데 실패했습니다.');
    } finally {
        setLoading(false);
    }
};

// 프로필 업데이트
export const updateProfile = async (formData, profileImage) => {
    try {
        const hardcodedToken =
          'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzQwNDcwNDMyLCJleHAiOjE3NDA0Nzc2MzJ9.4ERgQnvwmZZASCEqzVYh13BQc1feOrxg9c4DUuAorr0';

        const formDataToSend = new FormData();
        
        // info로 JSON 데이터 추가
        formDataToSend.append('info', JSON.stringify(formData));
        
        // 프로필 이미지가 있는 경우 file 키로 추가
        if (profileImage instanceof File) {
            formDataToSend.append('file', profileImage);
        }
        
        const response = await axios.put(`${API_BASE_URL}/members/changeinfo`, formDataToSend, {
            headers: { 
                'Authorization': `Bearer ${hardcodedToken}`,
                // Content-Type 헤더를 명시적으로 설정하지 않음 (axios가 자동으로 설정)
            }
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
        const response = await axios.post(`${API_BASE_URL}/members/profile-image`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 프로필 이미지 삭제
export const deleteProfileImage = async () => {
    try {
        await axios.delete(`${API_BASE_URL}/members/profile-image`);
    } catch (error) {
        throw error;
    }
}; 