import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
import { Select, MenuItem, Avatar, Divider, Snackbar, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// API 호출 (25.02.14 수정)
import { checkEmail, sendVerificationEmail, verifyEmailCode, registerUser } from 'api/auth';


// ===========================|| JWT - REGISTER ||=========================== //

export default function AuthRegister() {
  const theme = useTheme();
  const navigate = useNavigate();

  // 기존 코드 (기존 세팅되어있던)
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);

  // 추가 코드 (우리 회원가입 정보에 맞게)
  const [email, setEmail] = useState('');
  const [emailCheck, setEmailCheck] = useState(false); // 이메일 인증 여부
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nationality, setNationality] = useState('');
  const [language, setLanguage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);  // 미리보기용 URL
  const [fileInputKey, setfileInputKey] = useState(Date.now()); // 파일 input 초기화용 key
  // 로딩 상태 추가
  const [loading, setLoading] = useState(false);

  // 스낵바 상태 추가
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 완료 모달 상태 추가
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 스낵바 표시 함수
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // 기존 코드
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // 추가 코드
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // 이메일 중복 체크 (25.02.17 추가)
  const handleCheckEmail = async () => {
    try {
      await checkEmail(email);
      showSnackbar("사용 가능한 이메일입니다.");
    } catch (error) {
      showSnackbar(error.message || "이메일 중복 확인 오류", "error");
    }
  };

  // 이메일 인증 코드 발송 (25.02.17 - 실제 이메일 버전)
  const handleSendVerificationCode = async () => {
    try {
      setLoading(true); // 로딩 시작
      const response = await sendVerificationEmail(email);

      console.log("📩 인증 코드 응답:", response);  // ✅ 백엔드 응답 확인

      // 응답 구조에 따라 success 필드를 올바르게 확인
      if (response.data && response.data.success) {
        // 스낵바 제거하고 텍스트만 표시
        setIsVerified(true); // 인증 코드가 발송됨을 표시
      } else {
        showSnackbar('인증 코드 전송 실패', 'error');
      }
    } catch (error) {
      showSnackbar(error.message || '인증 코드 요청 중 오류 발생', 'error');
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 인증 코드 확인 (25.02.17 - 실제 이메일 버전)
  const handleVerifyCode = async () => {
    try {
      const response = await verifyEmailCode(email, verificationCode); // ✅ GET 요청 사용

      console.log("📩 인증 코드 검증 결과:", response); // ✅ 응답 확인 로그

      if (response.data && response.data.success) {
        setEmailCheck(true);
      } else {
        showSnackbar("❌ 인증 코드가 일치하지 않습니다.", "error");
      }
    } catch (error) {
      showSnackbar(error.message || "❌ 인증 코드 검증 중 오류 발생", "error");
    }
  };

  // 프로필 이미지 업로드 (추가 코드)
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);  // ✅ 실제 파일 저장
      setPreviewImage(URL.createObjectURL(file));  // ✅ 미리보기 URL 생성
      showSnackbar("프로필 이미지가 설정되었습니다.");
    }
  };

  // 프로필 이미지 삭제 (추가 코드)
  const removeProfileImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
    setFileInputKey(Date.now()); // 파일 input 초기화
    showSnackbar("프로필 이미지가 삭제되었습니다.", "info");
  };

  // 회원가입 요청 (25.02.17 추가)
  const handleRegister = async () => {
    if (!emailCheck) {
      showSnackbar('이메일 인증을 완료해야 합니다.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showSnackbar("비밀번호가 일치하지 않습니다.", "error");
      return;
    }
    if (password.length < 8) {
      showSnackbar("비밀번호는 8자 이상이어야 합니다.", "error");
      return;
    }

    const formData = new FormData();

    // signupDTO 데이터를 JSON으로 변환하여 추가
    const signupDTO = JSON.stringify({
      email: email,
      password: password,
      name: name,
      nationality: nationality,
      language: language,
      emailCheck: true, // 이메일 인증 완료 여부 추가
    });

    formData.append("signupDTO", new Blob([signupDTO], { type: "application/json" }));

    if (profileImage) {
      console.log("✅ 파일 추가됨:", profileImage);
      formData.append("file", profileImage);  // 📌 파일 추가
    } else {
      console.log("⚠️ 프로필 이미지 없음");
    }

    console.log("전송할 FormData:", formData); // 🚀 디버깅을 위해 FormData 확인

    console.log("📦 FormData 전송 데이터:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]); // 🚀 확인 로그
    }

    try {
      setLoading(true); // 로딩 시작
      await registerUser(formData, {
        headers: {
          "Content-Type": "multipart/form-data", // 📌 Content-Type 명시적으로 지정
        },
      });
      setOpenSuccessModal(true); // 성공 모달 표시
    } catch (error) {
      showSnackbar(error.message || "회원가입 중 오류가 발생했습니다.", "error");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 모달 확인 후 로그인 페이지로 이동
  const handleSuccessModalClose = () => {
    setOpenSuccessModal(false);
    navigate("/pages/login");
  };

  return (
    <>
      {/* 이메일 입력 및 인증 */}
      <Grid container spacing={1} alignItems="flex-start">
        <Grid item xs={10} sx={{ width: '70%' }}>
          <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="email">이메일</InputLabel>
            <OutlinedInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
            />
            {isVerified && !emailCheck && (
              <Typography 
                variant="caption" 
                color="secondary" 
                sx={{ 
                  mt: 0.5, 
                  ml: 1, 
                  display: 'block', 
                  position: 'relative',
                  height: '18px',

                  whiteSpace: 'nowrap',

                  textOverflow: 'ellipsis'
                }}
              >
                인증 코드가 발송되었습니다! 이메일을 확인해주세요.
              </Typography>
            )}
            {!isVerified && (
              <Box sx={{ height: '18px' }} /> // 메시지 없을 때도 같은 높이 유지
            )}
          </FormControl>
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Button 
            variant="contained" 
            color="secondary" 
            fullWidth 
            sx={{ 
              fontSize: '12px',
              height: '40px',
              marginTop: '22px' // InputLabel과 입력 필드 높이를 고려한 조정
            }} 
            onClick={handleSendVerificationCode} 
            disabled={!email || emailCheck || loading}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <span>발송중...</span>
              </Box>
            ) : (
              '인증코드 발송'
            )}
          </Button>
        </Grid>
      </Grid>

      {/* 인증코드 입력 */}
      <Grid container spacing={1} sx={{ mt: 0.5 }} alignItems="flex-start">
        <Grid item xs={10} sx={{ width: '70%' }}>
          <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="verification-code">인증코드</InputLabel>
            <OutlinedInput
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증코드를 입력하세요"
              endAdornment={
                emailCheck && (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold' }}>
                      인증완료
                    </Typography>
                  </InputAdornment>
                )
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ 
              fontSize: '12px', 
              height: '40px',
              marginTop: '22px' // InputLabel과 입력 필드 높이를 고려한 조정
            }}
            onClick={handleVerifyCode}
            disabled={emailCheck} // ✅ 인증 성공하면 버튼 비활성화
          >
            인증코드 확인
          </Button>
        </Grid>
      </Grid>

      {/* 비밀번호 입력 */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput, mt: 2.5 }}>
        <InputLabel htmlFor="outlined-adornment-password-register">비밀번호</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-register"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요 (8자 이상)"
          error={password.length > 0 && password.length < 8}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
        {password.length > 0 && password.length < 8 && (
          <Typography color="error" variant="caption" sx={{ mt: 1, ml: 1 }}>
            비밀번호는 8자 이상이어야 합니다.
          </Typography>
        )}
      </FormControl>

      {/* 비밀번호 확인 */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput, mt: 2.5 }}>
        <InputLabel htmlFor="outlined-adornment-confirm-password">비밀번호 확인</InputLabel>
        <OutlinedInput
          id="outlined-adornment-confirm-password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          error={confirmPassword.length > 0 && password !== confirmPassword}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownPassword}>
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <Typography color="error" variant="caption" sx={{ mt: 1, ml: 1 }}>
            비밀번호가 일치하지 않습니다.
          </Typography>
        )}
      </FormControl>

      {/* 이름 입력 */}
      <FormControl fullWidth sx={{ ...theme.typography.customInput, mt: 2.5 }}>
        <InputLabel>이름</InputLabel>
        <OutlinedInput
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
        />
      </FormControl>

      {/* 국적 선택 (SelectBox) */}
      <FormControl fullWidth sx={{ 
        ...theme.typography.customInput, 
        mt: 2.5,
        '& .MuiInputLabel-root': {
          top: 5,
          left: 0,
          color: theme.palette.grey[500],
          '&[data-shrink="true"]': {
            top: -9,
           
            transform: 'scale(0.75)',
            background: 'white',
            padding: '0 8px'
          }
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px'
        },
        '& .MuiSelect-select': {
          padding: '30.5px 14px 11.5px !important',
          fontSize: '0.875rem'
        }
      }}>
        <InputLabel>국적 선택</InputLabel>
        <Select
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          placeholder="국적을 선택하세요"
        >
          <MenuItem value="KR">대한민국 / Republic of Korea</MenuItem>
          <MenuItem value="US">미국 / America</MenuItem>
          <MenuItem value="JP">일본 / Japan</MenuItem>
        </Select>
      </FormControl>

      {/* 사용 언어 선택 (SelectBox) */}
      <FormControl fullWidth sx={{ 
        ...theme.typography.customInput, 
        mt: 2.5,
        '& .MuiInputLabel-root': {
          top: 5,
          left: 0,
          color: theme.palette.grey[500],
          '&[data-shrink="true"]': {
            top: -9,
            left: -5,
            transform: 'scale(0.75)',
            background: 'white',
            padding: '0 8px'
          }
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px'
        },
        '& .MuiSelect-select': {
          padding: '30.5px 14px 11.5px !important',
          fontSize: '0.875rem'
        }
      }}>
        <InputLabel>사용 언어 선택</InputLabel>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="언어를 선택하세요"
        >
          <MenuItem value="ko">한국어 / Korean</MenuItem>
          <MenuItem value="en">영어 / English</MenuItem>
          <MenuItem value="jp">일본어 / Japanese</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ mt: 3.5, mb: 3 }} />

      {/* 프로필 이미지 업로드 */}
      <Typography variant="h4" sx={{ mb: 2 }}>프로필 이미지</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={previewImage}
          sx={{ 
            width: 110, 
            height: 110, 
            mb: 2, 
            bgcolor: '#f0f0f0',
            border: '1px solid #e0e0e0',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('profile-image-input').click()}
        >
          {!previewImage && <CameraAltIcon sx={{ fontSize: 40, color: '#9e9e9e' }} />}
        </Avatar>
        
        {/* 이미지 관련 버튼 */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="outlined"
            size="small" 
            sx={{ 
              color: theme.palette.secondary.main,
              borderColor: theme.palette.secondary.main,
              bgcolor: 'white',
              boxShadow: 'none',
              px: 2,
              py: 0.7,
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: theme.palette.secondary.dark,
                color: theme.palette.secondary.dark,
                bgcolor: 'white'
              }
            }}
            onClick={removeProfileImage}
            disabled={!profileImage}
          >
            이미지 삭제
          </Button>
          
          <Button 
            variant="contained"
            size="small"
            color="secondary"
            component="label"
            sx={{ 
              boxShadow: 'none',
              px: 2,
              py: 0.7,
              fontSize: '0.85rem',
            }}
          >
            이미지 설정
            <input 
              id="profile-image-input"
              type="file" 
              hidden 
              accept="image/*" 
              onChange={handleProfileImageUpload} 
              key={fileInputKey}
            />
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mt: 3.5, mb: 3.5 }} />

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button
            disableElevation
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            color="secondary"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>가입 중...</span>
              </Box>
            ) : (
              '회원가입'
            )}
          </Button>
        </AnimateButton>
      </Box>

      {/* 스낵바 컴포넌트 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 회원가입 성공 모달 */}
      <Dialog
        open={openSuccessModal}
        onClose={handleSuccessModalClose}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        maxWidth="xs" // 모달창의 최대 너비를 xs 크기로 제한
        PaperProps={{
          sx: {
            width: '80%', // 모달창의 너비를 화면의 80%로 설정
            maxWidth: '400px' // 모달창의 최대 너비를 400px로 제한
          }
        }}
      >
        <DialogTitle id="success-dialog-title">
          {"회원가입 완료"} {/* 모달창 제목 텍스트 */}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="success-dialog-description" sx={{ fontSize: '13.5px' }}> {/* 모달창 내용 텍스트 CSS - 폰트 크기 설정 */}
            회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다. {/* 모달창 내용 텍스트 */}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', pr: 3, pb: 2 }}> {/* 버튼 오른쪽 정렬 및 우측/하단 여백 추가 */}
          <Button 
            onClick={handleSuccessModalClose} 
            variant="contained"
            color="secondary"
            autoFocus
            sx={{ width: '80px' }} // 버튼 너비 지정
          >
            확인 {/* 버튼 텍스트 */}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
