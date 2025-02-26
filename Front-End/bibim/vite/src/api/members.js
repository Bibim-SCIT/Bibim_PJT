import axios from 'axios';

// 백엔드 API 기본 URL 설정
const API_BASE_URL = "http://localhost:8080"; // 백엔드 API 기본 URL

/**
 * 사용자 정보를 백엔드에서 가져오는 함수
 * @param {Function} setUserInfo - 사용자 정보를 상태에 저장하는 함수
 * @param {Function} setLoading - 로딩 상태를 관리하는 함수
 * @param {Function} setError - 에러 상태를 관리하는 함수
 * @returns {Promise<void>} - 비동기 작업 완료 후 Promise
 */
export const fetchUserInfo = async (setUserInfo, setLoading, setError) => {
    try {
        setLoading(true);
        
        // 포스트맨에서 가져온 고정 토큰 사용(임시시)
        const hardcodedToken =
          'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzQwNDcwNDMyLCJleHAiOjE3NDA0Nzc2MzJ9.4ERgQnvwmZZASCEqzVYh13BQc1feOrxg9c4DUuAorr0';
        
        try {
            // 백엔드 API 호출하여 사용자 정보 가져오기
            const response = await axios.get(`${API_BASE_URL}/members/myinfo`, {
                headers: {
                    'Authorization': `Bearer ${hardcodedToken}`
                }
            });
            
            // 응답 데이터 확인 및 처리
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

/**
 * 사용자 프로필 정보를 업데이트하는 함수
 * @param {Object} formData - 업데이트할 사용자 정보 객체
 * @param {File|null} profileImage - 업로드할 프로필 이미지 파일
 * @returns {Promise<Object>} - 백엔드 응답 데이터
 */
export const updateProfile = async (formData, profileImage) => {
    try {
        // 인증 토큰 설정
        const hardcodedToken =
          'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzQwNDcwNDMyLCJleHAiOjE3NDA0Nzc2MzJ9.4ERgQnvwmZZASCEqzVYh13BQc1feOrxg9c4DUuAorr0';

        // FormData 객체 생성 (파일과 JSON 데이터를 함께 전송하기 위함)
        const formDataToSend = new FormData();
        
        // info로 JSON 데이터 추가 (객체를 문자열로 변환)
        formDataToSend.append('info', JSON.stringify(formData));
        
        // 프로필 이미지가 있는 경우 file 키로 추가
        if (profileImage instanceof File) {
            formDataToSend.append('file', profileImage);
        }
        
        // PUT 요청으로 프로필 정보 업데이트
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


// ============================ 이하 확인 안된 코드 ========================= 
/**
 * 프로필 이미지만 업로드하는 함수
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<Object>} - 백엔드 응답 데이터
 */
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

/**
 * 프로필 이미지를 삭제하는 함수
 * @returns {Promise<void>} - 비동기 작업 완료 후 Promise
 */
export const deleteProfileImage = async () => {
    try {
        await axios.delete(`${API_BASE_URL}/members/profile-image`);
    } catch (error) {
        throw error;
    }
}; 