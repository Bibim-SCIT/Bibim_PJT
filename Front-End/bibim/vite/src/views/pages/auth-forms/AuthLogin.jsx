import { useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Google Login
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import jwt_decode from 'jwt-decode';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const theme = useTheme();

  const [checked, setChecked] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Google 로그인 성공 시 실행되는 함수
  const handleGoogleLoginSuccess = (response) => {
    const decodedToken = jwt_decode(response.credential);
    console.log('Google 로그인 성공:', decodedToken);

    // 예: 서버에 Google 토큰 전송
    // fetch('/api/google-login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ token: response.credential })
    // })
    //   .then((res) => res.json())
    //   .then((data) => console.log('서버 응답:', data))
    //   .catch((err) => console.error('오류 발생:', err));
  };

  // Google 로그인 실패 시 실행되는 함수
  const handleGoogleLoginFailure = () => {
    console.error('Google 로그인 실패');
  };

  return (
    <>
      {/* 이메일 입력창 */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-email-login">이메일 / email adress</InputLabel>
        <OutlinedInput id="outlined-adornment-email-login" type="email" placeholder="이메일을 입력해주세요" name="email" inputProps={{}} />
      </FormControl>

      {/* 비밀번호 입력창 */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
        <InputLabel htmlFor="outlined-adornment-password-login">비밀번호 / password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-login"
          type={showPassword ? 'text' : 'password'}
          placeholder='비밀번호를 입력해주세요'
          name="password"
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          inputProps={{}}
          label="Password"
        />
      </FormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
            label="로그인 상태로 유지"
          />
        </Grid>
        {/* <Grid>
          <Typography variant="subtitle1" component={Link} to="/forgot-password" color="secondary" sx={{ textDecoration: 'none' }}>
            비밀번호를 잊어버리셨나요?
          </Typography>
        </Grid> */}
      </Grid>
      {/* 버튼 박스 */}
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained">
            로그인
          </Button>
        </AnimateButton>
      </Box>
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained" href='/pages/register'>
            회원가입
          </Button>
        </AnimateButton>
      </Box>

      {/* 구글 로그인 버튼 */}
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            useOneTap
          />
        </Box>
      </GoogleOAuthProvider>
    </>
  );
}
