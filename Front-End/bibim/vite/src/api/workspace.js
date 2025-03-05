/**
 * 워크스페이스 업데이트
 * @param {string} wsName - 현재 워크스페이스 이름
 * @param {string} newName - 새로운 워크스페이스 이름
 * @param {File} file - 새로운 워크스페이스 이미지 (선택사항)
 */
export const updateWorkspace = async (wsName, newName, file) => {
    try {
        const formData = new FormData();
        formData.append('wsName', wsName);
        formData.append('newName', newName);
        
        if (file) {
            formData.append('file', file);
        }

        const response = await axios.put(`${API_BASE_URL}/workspace`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${hardcodedToken}`
            }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
}; 