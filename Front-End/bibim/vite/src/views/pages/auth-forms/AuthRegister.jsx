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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// 추가 import
import { Select, MenuItem, Avatar, Divider } from "@mui/material"
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===========================|| JWT - REGISTER ||=========================== //

export default function AuthRegister() {
  const theme = useTheme();

  // 기존 코드 (기존 세팅되어있던)
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);

  // 추가 코드 (우리 회원가입 정보에 맞게)
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nationality, setNationality] = useState('');
  const [language, setLanguage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [fileInputKey, setfileInputKey] = useState(Date.now()); // 파일 input 초기화용 key

  // 기존 코드
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // 추가 코드
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // 이메일 인증 코드 발송 (추가 코드)
  const sendVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 난수 생성
    setGeneratedCode(code);
    alert(`이메일 (${email})로 인증 코드가 발송되었습니다: ${code}`); // 실제 환경에서는 이메일 API 사용
  };

  // 인증 코드 확인 (추가 코드)
  const verifyCode = () => {
    if (verificationCode === generatedCode) {
      setIsVerified(true);
      alert('이메일 인증 성공!');
    } else {
      alert('인증 코드가 올바르지 않습니다.');
    }
  };

  // 프로필 이미지 업로드 (추가 코드)
  // const handleProfileImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   setProfileImage(URL.createObjectURL(file)); // 미리보기 기능
  // };
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  // 프로필 이미지 삭제 (추가 코드)
  const removeProfileImage = () => {
    setProfileImage(null);
    setFileInputKey(Date.now()); // 파일 input 초기화
  };

  return (
    <>
      {/* 이메일 입력 및 인증 */}
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={10}>
          <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="email">이메일</InputLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
            />
          </FormControl>
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" color="secondary" fullWidth sx={{ fontSize: '12px', height: '35px' }} onClick={sendVerificationCode} disabled={!email}>
            인증코드 발송
          </Button>
        </Grid>
        {/* <Grid item xs={4}>
          <Button variant="contained" color="secondary" fullWidth sx={{ height: '35px' }} onClick={sendVerificationCode} disabled={!email}>
            인증코드 발송
          </Button>
        </Grid> */}
      </Grid>

      {/* 인증코드 입력 */}
      <Grid container spacing={1} sx={{ mt: 1 }} alignItems="center">
        <Grid item xs={8}>
          <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="verification-code">인증코드</InputLabel>
            <OutlinedInput
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증코드를 입력하세요"
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" color="secondary" fullWidth sx={{ fontSize: '12px', height: '35px' }} onClick={verifyCode} disabled={isVerified}>
            인증코드 확인
          </Button>
        </Grid>
      </Grid>

      {/* 비밀번호 입력 */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput, mt: 2 }}>
        <InputLabel htmlFor="outlined-adornment-password-register">비밀번호</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-register"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      {/* 비밀번호 확인 */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput, mt: 1 }}>
        <InputLabel htmlFor="outlined-adornment-confirm-password">비밀번호 확인</InputLabel>
        <OutlinedInput
          id="outlined-adornment-confirm-password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          error={password !== confirmPassword}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownPassword}>
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>

      {/* 국적 선택 (SelectBox) */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel shrink>국적 선택</InputLabel>
        <Select value={nationality} onChange={(e) => setNationality(e.target.value)}>
          <MenuItem value="KR">대한민국 / Republic of Korea</MenuItem>
          <MenuItem value="US">미국 / America</MenuItem>
          <MenuItem value="JP">일본 / Japan</MenuItem>
        </Select>
      </FormControl>

      {/* 사용 언어 선택 (SelectBox) */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel shrink>사용 언어 선택</InputLabel>
        <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <MenuItem value="ko">한국어 / Korean</MenuItem>
          <MenuItem value="en">영어 / English</MenuItem>
          <MenuItem value="jp">일본어 / Japanese</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ mt: 3, mb: 3 }} />

      {/* 프로필 이미지 업로드 */}
      <Typography variant="h4" sx={{ mt: 3, mb: 1 }}>프로필 이미지</Typography>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={profileImage}
          sx={{ width: 80, height: 80, backgroundColor: '#ccc' }}
        >
          {!profileImage && <CameraAltIcon />}
        </Avatar>
        <Box sx={{ mt: 1 }}>
          <Button variant="contained" component="label">
            사진 업로드
            <input type="file" hidden accept="image/*" onChange={handleProfileImageUpload} />
          </Button>
          {profileImage && (
            <Button color="error" onClick={removeProfileImage} sx={{ ml: 1 }}>
              사진 제거
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ mt: 3, mb: 3 }} />

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="secondary">
            회원가입
          </Button>
        </AnimateButton>
      </Box>
    </>
  );
}
