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
  MenuItem,
  CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import Avatar from '@mui/material/Avatar';
import MainCard from 'ui-component/cards/MainCard';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { getUserInfo } from 'api/auth';
import { updateUserInfo } from 'api/members';
import { useNavigate } from 'react-router-dom';
import { useContext } from "react";
import { ConfigContext } from "contexts/ConfigContext";

// ✅ 국적 매핑 (코드 → 풀 네임)
const nationalityMap = {
  'KR': '대한민국 / Republic of Korea',
  'US': '미국 / America',
  'JP': '일본 / Japan'
};

// ✅ 사용 언어 매핑 (코드 → 풀 네임)
const languageMap = {
  'ko': '한국어 / Korean',
  'en': '영어 / English',
  'jp': '일본어 / Japanese'
};

const MyInfoUpdate = () => {
  const { user, setUser } = useContext(ConfigContext);

  // ✅ 상태 관리
  const [loading, setLoading] = useState(true);  // 초기 로딩 상태는 true로 설정
  const [error, setError] = useState(null);  // 에러 상태 추가
  const [userInfo, setUserInfo] = useState(null);  // 전체 사용자 정보
  const [formData, setFormData] = useState({  // 폼 데이터 상태
    name: "",
    nationality: "",
    language: "",
    email: "",
    profileImage: "",
  });
  const [profileImage, setProfileImage] = useState(null);  // 프로필 이미지 파일
  const [previewImage, setPreviewImage] = useState(null);  // 이미지 미리보기 URL
  const [fileInputKey, setFileInputKey] = useState(Date.now());  // 파일 input 초기화용 key
  const [updating, setUpdating] = useState(false);  // 업데이트 중 상태 (저장 버튼 비활성화용)
  const navigate = useNavigate();

  /**
   * 최초 마운트 시 사용자 정보 조회
   * auth.js의 getUserInfo API를 호출하여 사용자 정보 가져옴
   */
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const data = await getUserInfo();
        setUserInfo(data);
        setFormData({
          name: data.name || "",
          nationality: data.nationality || "",
          language: data.language || "",
          email: data.email || "",
          profileImage: data.profileImage || "",
        });

        // 프로필 이미지가 있으면 미리보기 설정
        if (data.profileImage) {
          setPreviewImage(data.profileImage);
        }
      } catch (err) {
        console.error("❌ 사용자 정보 가져오기 실패:", err);
        setError("회원 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /**
   * 폼 입력값 변경 핸들러
   * @param {Event} event - 입력 필드의 변경 이벤트
   * event.target.name을 key로 사용하여 해당 필드값 업데이트
   */
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  /**
   * 회원 정보 수정 제출 핸들러
   * members.js의 updateUserInfo API를 호출하여 서버에 수정 요청
   * 성공 시 최신 정보를 다시 불러옴
   */
  const handleSubmit = async () => {
    setUpdating(true);
    try {
      await updateUserInfo(formData, profileImage);  // API 호출 시 profileImage 전달

      // 최신 사용자 정보 다시 불러오기
      const updatedUser = await getUserInfo();
      setUser(updatedUser); // 🔹 Context의 사용자 정보 업데이트

      // 업데이트 성공 알림
      alert("회원 정보가 수정되었습니다!");

      // 프로필 페이지로 이동
      navigate('/mypage');
    } catch (error) {
      console.error("❌ 회원 정보 수정 실패:", error);
      setError("회원 정보 수정에 실패했습니다.");
      alert("회원 정보 수정에 실패했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  /**
   * 이미지 업로드 핸들러
   * 선택된 이미지 파일을 상태에 저장하고 미리보기 생성
   * @param {Event} event - 파일 입력 변경 이벤트
   */
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);  // 실제 파일 저장
      setPreviewImage(URL.createObjectURL(file));  // 브라우저 메모리에 미리보기 URL 생성
    }
  };

  /**
   * 이미지 삭제 핸들러
   * 프로필 이미지와 미리보기를 초기화하고 
   * 파일 input을 리셋하기 위해 key값 갱신
   */
  const handleDeleteImage = () => {
    setProfileImage(null);  // 이미지 파일 초기화
    if (previewImage) {
      URL.revokeObjectURL(previewImage);  // 브라우저 메모리에서 미리보기 URL 제거
      setPreviewImage(null);
    }
    setFileInputKey(Date.now());  // 파일 input 초기화를 위한 key 갱신

    // 프로필 이미지 필드도 초기화
    setFormData({
      ...formData,
      profileImage: ""
    });
  };

  // 로딩 중이면 로딩 인디케이터 표시
  if (loading) {
    return (
      <MainCard title="회원정보 수정">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  // 에러가 있으면 에러 메시지 표시
  if (error) {
    return (
      <MainCard title="회원정보 수정">
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      </MainCard>
    );
  }

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
              {formData.email}
            </Typography>
          </Grid>

          {/* 사용자 정보 입력 필드 영역 */}
          {/* 이름 입력 필드 */}
          <Grid item xs={12} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
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
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                >
                  <MenuItem value="KR">한국 / Korea</MenuItem>
                  <MenuItem value="US">미국 / America</MenuItem>
                  <MenuItem value="JP">일본 / Japan</MenuItem>
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
              <FormControl fullWidth size="small">
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <MenuItem value="ko">한국어 / Korean</MenuItem>
                  <MenuItem value="en">영어 / English</MenuItem>
                  <MenuItem value="jp">일본어 / Japanese</MenuItem>
                </Select>
              </FormControl>
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
              {/* 취소 버튼 추가 */}
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/mypage')}
              >
                취소
              </Button>

              {/* 저장 버튼 */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={updating}
              >
                {updating ? '저장 중...' : '저장'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
};

export default MyInfoUpdate;
