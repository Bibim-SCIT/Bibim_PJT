// 필요한 리액트와 MUI 컴포넌트들을 임포트
import { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  FormControl,
  Select,
  InputLabel,
  MenuItem
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import Avatar from '@mui/material/Avatar';
import MainCard from 'ui-component/cards/MainCard';
import { fetchProfileData, updateProfile, uploadProfileImage, deleteProfileImage } from 'api/members';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const MyInfoUpdate = () => {
  // 상태 관리를 위한 useState 훅 정의
  const [profileImage, setProfileImage] = useState(null);    // 프로필 이미지 상태
  const [previewImage, setPreviewImage] = useState(null);  // 미리보기용 URL
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // 파일 input 초기화용 key
  const [formData, setFormData] = useState({                 // 사용자 정보 폼 데이터
    name: '',
    country: '',
    language: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await updateProfile(formData, profileImage);
      // 성공 처리
    } catch (error) {
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);  // 실제 파일 저장
      setPreviewImage(URL.createObjectURL(file));  // 미리보기 URL 생성
    }
  };

  const handleDeleteImage = () => {
    // 선택된 이미지 파일 초기화
    setProfileImage(null);
    
    // 미리보기 URL 초기화
    if (previewImage) {
        URL.revokeObjectURL(previewImage);  // 메모리 정리
        setPreviewImage(null);
    }
    
    // 파일 input 초기화
    setFileInputKey(Date.now());
  };

  useEffect(() => {
    fetchProfileData().then(data => {
      setFormData({
        name: data.name,
        country: data.country,
        language: data.language
      });
      setProfileImage(data.profileImage);
      setPreviewImage(data.profileImage); // 프로필 이미지 URL 설정
    }).catch(error => {
      setError('프로필 정보를 불러오는데 실패했습니다.');
      console.error(error);
    });
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
                gap: 1
            }}>
                <Avatar 
                    sx={{ 
                        width: 120,
                        height: 120,
                        bgcolor: '#f5f5f5',
                        cursor: 'pointer'
                    }}
                    alt="프로필 이미지"
                    src={previewImage}
                    onClick={() => document.getElementById('profile-upload').click()}
                >
                    {!previewImage && <CameraAltIcon />}
                </Avatar>
                <input
                    id="profile-upload"
                    key={fileInputKey}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                
                {/* 이미지 관리 버튼 그룹 */}
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
                        component="label"
                        size="small"
                    >
                        이미지 설정
                        <input
                            key={fileInputKey}
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
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

          {/* 국적 선택 필드 */}
          <Grid item xs={12} sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box sx={{ width: '40%' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>국적</Typography>
             <FormControl fullWidth size="small">
              <Select
                name="language"
                value={formData.language}
                onChange={handleChange}
                variant="outlined"
              >
                <MenuItem value="ko">한국어 / Korean</MenuItem>
                <MenuItem value="en">영어 / English</MenuItem>
                <MenuItem value="jp">일본어 / Japanese</MenuItem>
              </Select>
            </FormControl>
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

export default MyInfoUpdate;
