import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Stack, Chip, IconButton, Divider, Grid, CircularProgress } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { getUserInfo } from '../../../api/auth';
import { useNavigate } from 'react-router-dom';
import GlowingAvatar from './GlowingAvatar';

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



const MyInfo = () => {
  // 상태 관리를 위한 useState
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ✅ API 호출하여 사용자 정보 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserInfo();  // ✅ auth.js에서 가져옴
        setUserInfo(data);  // ✅ 사용자 정보 업데이트
      } catch (err) {
        setError("회원 정보를 불러오는 중 오류가 발생했습니다.");
        console.error("❌ 사용자 정보 가져오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            {/* <Avatar
              sx={{
                width: 150,
                height: 150,
                mt: 2
              }}
              alt={`${userInfo.name}의 프로필 이미지`}
              src={userInfo.profileImage}
            /> */}
            <GlowingAvatar src={userInfo.profileImage} alt={`${userInfo.name}의 프로필`} />


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
                    {/* ✅ 국적 코드 → 실제 국가명으로 변환 */}
                    <Typography>{nationalityMap[userInfo.nationality] || '알 수 없음'}</Typography>
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
                    {/* ✅ 사용 언어 코드 → 실제 언어명으로 변환 */}
                    <Typography>{languageMap[userInfo.language] || '알 수 없음'}</Typography>
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