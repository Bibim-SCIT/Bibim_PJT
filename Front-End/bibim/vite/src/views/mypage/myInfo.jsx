import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Stack, Chip, IconButton, Divider, Grid } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import axios from 'axios';

// timeZoneMap을 컴포넌트 밖으로 이동
const timeZoneMap = {
  'KR': 'Asia/Seoul',
  'US': 'America/New_York',
  'JP': 'Asia/Tokyo'
};

// timeZoneAbbr도 컴포넌트 밖으로 이동
const timeZoneAbbr = {
  'Asia/Seoul': 'KST',
  'America/New_York': 'EST',
  'Asia/Tokyo': 'JST'
};

const MyInfo = () => {
  // 상태 관리를 위한 useState
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    nationality: '',
    language: '',
    profileImage: '',
    loginStatus: '',
    socialLoginCheck: '',
    regDate: ''
  });

  // 테스트용 데이터 설정
  useEffect(() => {
    // 테스트용 더미 데이터
    const testData = {
      email: 'test@example.com',
      name: '김테스트',
      nationality: 'US',  // 'KR', 'US', 'JP' 중 선택하여 테스트
      language: 'ko',
      profileImage: 'https://example.com/test.jpg',
      loginStatus: 'active',
      socialLoginCheck: 'N',
      regDate: '2024-03-19'
    };

    setUserInfo(testData);
  }, []);

  /* 실제 API 호출 코드 (주석 처리)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/members/myinfo');
        if (response.data.data.success) {
          setUserInfo(response.data.data);
        }
      } catch (error) {
        console.error('회원 정보 조회 실패:', error);
      }
    };

    fetchUserInfo();
  }, []); 
  */

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
        hour12: true  // 오전/오후 표시를 위해 true로 변경
    }).format(new Date());

    // "오전 9:44 KST" 형식으로 반환
    return `${time} ${timeZoneAbbr[timeZone]}`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        p: 3, 
        position: 'relative',
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}>
        {/* 설정 버튼 */}
        <IconButton sx={{ position: 'absolute', top: 8, right: 8 }}>
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
    </Box>
  );
};

export default MyInfo;
