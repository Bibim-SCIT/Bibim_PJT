import axios from "axios";

//const API_BASE_URL = "http://your-api-url.com/members"; // 백엔드 API 기본 URL
const API_BASE_URL = "http://localhost:8080/workspace"; // 백엔드 API 기본 URL

// 워크스페이스 리스트 가져오기
// test: 토큰값 임시
export const workspaceList = async () => 
{
    try 
    {   
        const token = localStorage.getItem('token');
        const response = await axios.get(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}`
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
        throw error.response?.data || "토큰 정보가 제대로 맞지 않음";
    }
};

export default workspaceList;