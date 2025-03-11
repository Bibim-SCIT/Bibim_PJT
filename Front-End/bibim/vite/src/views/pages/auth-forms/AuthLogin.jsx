import { useState, useContext } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, linkGoogleAccount, googleLoginUser, api } from "../../../api/auth"; // 로그인 API
import { ConfigContext } from "../../../contexts/ConfigContext"; // 기존 ConfigContext 사용

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog'; // 필요에 따라 모달 관련 컴포넌트를 사용할 수도 있음

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import GoogleIcon from '@mui/icons-material/Google'; // 구글 아이콘 추가

import LinkAccountModal from "../authentication/LinkAccountModal";

// Google Login
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { setUser, setToken } = useContext(ConfigContext); // ConfigContext 활용

  const [checked, setChecked] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // ❗ 로딩 상태 추가

  // 모달 관련 state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState(null);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // 로그인 시도할 때 기존 오류 초기화
    setLoading(true); // ✅ 로그인 시도 중 표시

    try {
      // ✅ 로그인 후 사용자 정보를 받아옴
      const userInfo = await loginUser(email, password);

      // ✅ 토큰을 Context에 설정
      setToken(localStorage.getItem("token"));

      // ✅ 사용자 정보 업데이트 (email, profileImage 포함)
      setUser(userInfo);

      console.log("🟢 로그인 후 사용자 정보:", userInfo);

      // ✅ 사용자 정보가 업데이트된 후 메인 페이지 이동
      navigate("/ws-select");

    } catch (err) {
      console.error("❌ 로그인 오류:", err);
      setError(err.message || "로그인 실패");
    } finally {
      setLoading(false); // ✅ 로그인 응답이 끝나면 로딩 상태 해제
    }
  };

  // Google 로그인 성공 시 실행되는 함수
  const handleGoogleLoginSuccess = (response) => {
    const decodedToken = jwtDecode(response.credential);
    console.log('Google 로그인 성공:', decodedToken);

    // googleLoginUser API 호출: decodedToken 객체를 그대로 전달
    googleLoginUser(decodedToken)
      .then((userInfo) => {
        // 토큰 저장 및 사용자 정보 업데이트는 googleLoginUser에서 처리됨
        // 추가로 필요한 경우 userInfo를 활용해 업데이트할 수 있음
        setUser(userInfo);
        navigate("/ws-select");
      })
      .catch((err) => {
        console.error('구글 로그인 처리 중 오류 발생:', err);
        if (err.errorCode === "UNLINKED_MEMBER") {
          setPendingGoogleData(decodedToken);
          setShowLinkModal(true);
        } else {
          setError(err.message || "구글 로그인 실패");
        }
      });
  };

  // Google 로그인 실패 시 실행되는 함수
  const handleGoogleLoginFailure = () => {
    console.error('Google 로그인 실패');
  };

  // 모달에서 "예" 클릭 시 처리 함수
  const handleLinkAccount = () => {
    if (!pendingGoogleData) return;
    linkGoogleAccount(pendingGoogleData.email, true)
      .then((res) => {
        // 연동 성공 후 다시 구글 로그인 시도
        googleLoginUser(pendingGoogleData)
          .then((userInfo) => {
            setUser(userInfo);
            navigate("/ws-select");
            setShowLinkModal(false);
            setPendingGoogleData(null);
          })
          .catch((err) => {
            setError(err.message || "구글 로그인 실패");
          });
      })
      .catch((err) => {
        setError(err.message || "연동 요청 실패");
      });
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        {/* 이메일 입력창 */}
        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="outlined-adornment-email-login">이메일 / email adress</InputLabel>
          <OutlinedInput
            id="outlined-adornment-email-login"
            type="email"
            placeholder="이메일을 입력해주세요"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{}}
          />
        </FormControl>

        {/* 비밀번호 입력창 */}
        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="outlined-adornment-password-login">비밀번호 / password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password-login"
            type={showPassword ? 'text' : 'password'}
            placeholder='비밀번호를 입력해주세요'
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* ❗ 로그인 실패 시 MUI Alert 표시 */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

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
        {/* <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button color="secondary" fullWidth size="large" type="submit" variant="contained">
              로그인
            </Button>
          </AnimateButton>
        </Box> */}

        {/* ✅ 로그인 버튼 - 로딩 중일 때 비활성화 및 스피너 추가 */}
        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button
              color="secondary"
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={loading} // ✅ 로그인 중 버튼 비활성화
              startIcon={loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : null} // ✅ 로딩 아이콘 표시
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </AnimateButton>
        </Box>


      </form>
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained" href='/pages/register'>
            회원가입
          </Button>
        </AnimateButton>
      </Box>

      {/* 구글 로그인 버튼 */}
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            useOneTap
          />
        </Box>
      </GoogleOAuthProvider >

      {/* LinkAccountModal 컴포넌트 사용 */}
      <LinkAccountModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onConfirm={handleLinkAccount}
      />
    </>
  );
}
