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

  // 컴포넌트가 마운트될 때 데이터를 가져오기 위한 useEffect
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/members/myinfo');  // API 엔드포인트는 실제 주소로 변경 필요
        if (response.data.data.success) {
          setUserInfo(response.data.data);
        }
      } catch (error) {
        console.error('회원 정보 조회 실패:', error);
      }
    };

    fetchUserInfo();
  }, []);  // 빈 배열을 넣어 마운트 시에만 실행

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
                  <Typography>{new Date().toLocaleTimeString()} KST</Typography>
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
