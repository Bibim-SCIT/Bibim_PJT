import { Link } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import AuthLogin from '../auth-forms/AuthLogin';

import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';

// ✅ 배경 비디오 파일 import
import backgroundVideo from '../../../assets/images/background/space.mp4'; // 경로에 맞게 수정

// ================================|| AUTH3 - LOGIN ||================================ //

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    // 전체 배경색 
    <AuthWrapper1>
      {/* ✅ 배경 비디오 추가 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0, // 가장 아래 배치
        }}
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid size={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
            <Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  {/* 로고 들어가는 부분 */}
                  <Grid sx={{ mb: 3 }}>
                    <Link to="/" aria-label="logo">
                      <Logo />
                    </Link>
                  </Grid>
                  {/* 로고 밑 인사말 들어가는 부분 */}
                  <Grid size={12}>
                    <Grid container direction={{ xs: 'column-reverse', md: 'row' }} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Grid>
                        <Stack spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                          <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                            당신의 협업을 위한 최고의 선택
                          </Typography>
                          <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                            Bibim
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '16px', textAlign: { xs: 'center', md: 'inherit' } }}>
                            계속 하려면 로그인 하세요
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* id 및 비밀번호 입력창 */}
                  <Grid size={12}>
                    <AuthLogin />
                  </Grid>
                  {/* 구분 선 */}
                  <Grid size={12}>
                    <Divider />
                  </Grid>
                  <Grid size={12}>
                    <Grid container direction="column" sx={{ alignItems: 'center' }} size={12}>
                      <Typography component={Link} to="/register" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                        Don&apos;t have an account?
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid sx={{ px: 3, my: 3 }} size={12}>
          {/* <AuthFooter /> */}
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
}
