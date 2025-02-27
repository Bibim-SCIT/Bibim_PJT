// 필요한 리액트와 MUI 컴포넌트들을 임포트
import { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Stack
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import Avatar from '@mui/material/Avatar';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';  // 상단에 axios import 추가

const SamplePage = () => {
  // 상태 관리를 위한 useState 훅 정의
  const [profileImage, setProfileImage] = useState(null);    // 프로필 이미지 상태
  const [formData, setFormData] = useState({                 // 사용자 정보 폼 데이터
    name: '홍길동',
    country: '대한민국',
    language: '한국어'
  });

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // 프로필 정보 조회 API 호출
  // GET /api/members/profile
  const fetchProfileData = async () => {
    try {
      // 백엔드 API에 GET 요청 전송
      const response = await axios.get('http://localhost:8080/api/members/profile');
      
      // 응답 데이터 구조 분해 할당
      const { name, country, language, email, profileImage } = response.data;
      
      // 상태 업데이트
      setFormData({ name, country, language });  // 폼 데이터 설정
      setProfileImage(profileImage);             // 프로필 이미지 설정
    } catch (error) {
      console.error('프로필 조회 실패:', error);
    }
  };

  // 프로필 정보 업데이트 API 호출
  // PUT /changeinfo
  const handleSubmit = async () => {
    try {
      // multipart/form-data 형식으로 전송하기 위한 FormData 객체 생성
      const formDataToSend = new FormData();
      
      // 회원 정보를 JSON 문자열로 변환하여 'info' 파트에 추가
      // @RequestPart("info") UpdateInfoDTO 형식에 맞춤
      formDataToSend.append('info', JSON.stringify(formData));
      
      // 이미지 파일이 있는 경우, 'file' 파트에 추가
      // @RequestPart(value = "file", required = false) MultipartFile 형식에 맞춤
      if (profileImage instanceof File) {
        formDataToSend.append('file', profileImage);
      }

      // 백엔드 API에 PUT 요청 전송
      // Content-Type을 multipart/form-data로 설정하여 파일과 데이터를 함께 전송
      await axios.put('http://localhost:8080/changeinfo', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // TODO: 성공 시 처리 (예: 성공 메시지 표시, 페이지 리다이렉트 등)
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      // TODO: 실패 시 처리 (예: 에러 메시지 표시)
    }
  };

  // 프로필 이미지 업로드 API 호출
  // POST /api/members/profile-image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];  // 선택된 파일
    const formData = new FormData();
    formData.append('image', file);      // 'image' 키로 파일 추가

    try {
      // 백엔드 API에 POST 요청으로 이미지 파일 전송
      const response = await axios.post('http://localhost:8080/api/members/profile-image', formData);
      setProfileImage(response.data.imageUrl);  // 반환된 이미지 URL로 상태 업데이트
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      // TODO: 실패 시 처리
    }
  };

  // 프로필 이미지 삭제 API 호출
  // DELETE /api/members/profile-image
  const handleDeleteImage = async () => {
    try {
      // 백엔드 API에 DELETE 요청 전송
      await axios.delete('/api/members/profile-image');
      setProfileImage(null);  // 프로필 이미지 상태 초기화
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      // TODO: 실패 시 처리
    }
  };

  // 컴포넌트 마운트 시 프로필 정보 자동 조회
  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <MainCard title="회원정보 수정">
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* 프로필 이미지 섹션 */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
            <Box sx={{ 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              gap: 1,
            }}>
              {/* 프로필 이미지 아바타 */}
              <Avatar
                sx={{ 
                  width: 120,
                  height: 120,
                  bgcolor: '#f5f5f5'
                }}
                alt="프로필 이미지"
                src={profileImage}
              />
              
              {/* 프로필 이미지 관리 버튼 그룹 */}
              <Stack sx={{ 
                flexDirection: 'row',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}>
                <Button
                  variant="text"
                  onClick={handleDeleteImage}
                  size="small"
                >
                  이미지 삭제
                </Button>

                <Button 
                  variant="contained"
                  size="small"
                >
                  이미지 설정
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* 사용자 이메일 표시 영역 */}
          <Grid item xs={12} sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 0.5, 
            mt: 0,
            mb: 0
          }}>
            <EmailIcon sx={{ fontSize: 16, color: '#666' }} />
            <Typography variant="body2" color="#666">
              minsu.kim@example.com
            </Typography>
          </Grid>

          {/* 사용자 정보 입력 필드 영역 */}
          {/* 이름 입력 필드 */}
          <Grid item xs={12} sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'  // 중앙 정렬
          }}>
            <Box sx={{ width: '40%' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>이름</Typography>
              <TextField
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>

          {/* 국적 입력 필드 */}
          <Grid item xs={12} sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box sx={{ width: '40%' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>국적</Typography>
              <TextField
                fullWidth
                name="country"
                value={formData.country}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>

          {/* 사용 언어 입력 필드 */}
          <Grid item xs={12} sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box sx={{ width: '40%' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>사용 언어</Typography>
              <TextField
                fullWidth
                name="language"
                value={formData.language}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
          

          {/* 하단 버튼 영역 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              justifyContent: 'flex-end',
              '& button': { minWidth: '80px' }
            }}>
              {/* 저장 버튼 */}
              <Button 
                variant="contained" 
                color="primary"
              >
                저장
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default SamplePage;
