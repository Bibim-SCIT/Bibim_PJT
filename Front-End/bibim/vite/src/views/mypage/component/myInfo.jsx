import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Stack, Chip, IconButton, Divider, Grid, CircularProgress } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { fetchUserInfo } from '../../../api/members';
import { useNavigate } from 'react-router-dom';

// 현지 시간 표시 위한 매핑
const timeZoneMap = {
  'KR': 'Asia/Seoul',
  'US': 'America/New_York',
  'JP': 'Asia/Tokyo'
};

// 현지 시간 기준 타임 표시 위한 매핑 
const timeZoneAbbr = {
  'Asia/Seoul': 'KST',
  'America/New_York': 'EST',
  'Asia/Tokyo': 'JST'
};

const MyInfo = () => {
  // 상태 관리를 위한 useState
  const [userInfo, setUserInfo] = useState({
    email: 'test@test.com',
    name: 'ㄴㅇㄴ',
    nationality: 'KR',
    language: 'ko',
    profileImage: '',
    loginStatus: '',
    socialLoginCheck: '',
    regDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useNavigate 훅 사용
  const navigate = useNavigate();

  // members에서 유저 조회 함수 호출 (로그인 후)
  useEffect(() => {
    fetchUserInfo(setUserInfo, setLoading, setError);
  }, []);

  // 사용자의 국적(nationality)에 따라 해당 국가의 현지 시간을 반환하는 함수
  const getLocalTime = (nationality) => {
    // nationality가 없을 경우 'KR' 사용
    const defaultNationality = 'KR';
    const currentNationality = nationality || defaultNationality;
    
    // timeZoneMap에서 해당 국가의 시간대를 가져옴
    const timeZone = timeZoneMap[currentNationality];
    
    // 시간 포맷팅 (초 제외)
    const time = new Intl.DateTimeFormat('ko-KR', {
        timeZone: timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true  // 오전/오후 표시 여부
    }).format(new Date());

    // "오전 9:44 KST" 형식으로 반환
    return `${time} ${timeZoneAbbr[timeZone]}`;
  };

  // 회원정보 수정 페이지로 이동하는 함수
  const handleEditProfile = () => {
    navigate('/mypage/update');
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      ) : (
        <Box sx={{ 
          p: 3, 
          position: 'relative',
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1
        }}>
          {/* 설정 버튼 */}
          <IconButton 
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={handleEditProfile}
          >
            <SettingsIcon />
          </IconButton>

          <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
            {/* 프로필 이미지에 실제 데이터 연결 */}
            <Avatar
              sx={{ 
                width: 150, 
                height: 150,
                mt: 2
              }}
              alt={`${userInfo.name}의 프로필 이미지`}
              src={userInfo.profileImage}
            />

            {/* 오른쪽 정보 영역에 실제 데이터 연결 */}
            <Stack spacing={2} flex={1}>
              <Typography variant="h2" sx={{ mb: 1 }}>{userInfo.name}</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PublicIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" color="text.secondary">국적</Typography>
                    </Stack>
                    <Typography>{userInfo.nationality}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" color="text.secondary">현지 시간</Typography>
                    </Stack>
                    <Typography>{getLocalTime(userInfo.nationality)}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LanguageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" color="text.secondary">사용 언어</Typography>
                    </Stack>
                    <Typography>{userInfo.language}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                    </Stack>
                    <Typography>{userInfo.email}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Stack>

          {/* 구분선 */}
          <Divider sx={{ my: 2 }} />

          {/* 계정 관리 영역 */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Stack direction="row" spacing={1} alignItems="center" 
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
              <LockResetIcon sx={{ fontSize: 16 }} />
              <Typography>비밀번호 변경</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center"
              sx={{ cursor: 'pointer', color: 'error.main', '&:hover': { color: 'error.dark' } }}>
              <PersonOffIcon sx={{ fontSize: 16 }} />
              <Typography>회원탈퇴</Typography>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default MyInfo; 