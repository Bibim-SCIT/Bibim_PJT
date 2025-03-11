import { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { sendChangePasswordMail, changePassword } from '../../../api/members';

/**
 * 모달 스타일 정의
 * 화면 중앙에 위치하며 그림자와 둥근 모서리를 가진 모달 디자인
 */
const style = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 24,
    p: 0,
    position: 'relative',
    outline: 'none'
};

/**
 * 비밀번호 변경 모달 컴포넌트
 * 
 * @param {boolean} open - 모달 표시 여부
 * @param {function} handleClose - 모달 닫기 함수
 * @returns {JSX.Element} 비밀번호 변경 모달 컴포넌트
 */
const ChangePasswordModal = ({ open, handleClose }) => {
    // 상태 관리
    const [email, setEmail] = useState(''); // 이메일 입력값
    const [verificationCode, setVerificationCode] = useState(''); // 인증 코드 입력값
    const [newPassword, setNewPassword] = useState(''); // 새 비밀번호 입력값
    const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인 입력값
    const [showNewPassword, setShowNewPassword] = useState(false); // 새 비밀번호 표시 여부
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 비밀번호 확인 표시 여부
    const [sendCodeLoading, setSendCodeLoading] = useState(false); // 인증 코드 전송 로딩 상태
    const [submitLoading, setSubmitLoading] = useState(false); // 비밀번호 변경 제출 로딩 상태
    const [error, setError] = useState(''); // 오류 메시지
    const [success, setSuccess] = useState(''); // 성공 메시지
    const [emailSent, setEmailSent] = useState(false); // 이메일 전송 완료 여부

    /**
     * 인증 코드 전송 처리 함수
     * 이메일 주소로 비밀번호 변경 인증 코드를 전송합니다.
     */
    const handleSendVerificationCode = async () => {
        // 이메일 입력 확인
        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }

        try {
            // 로딩 상태 시작 및 오류 초기화
            setSendCodeLoading(true);
            setError('');
            
            // API 호출하여 인증 코드 전송
            await sendChangePasswordMail(email);
            
            // 성공 상태 설정
            setEmailSent(true);
            setSuccess('인증 코드가 이메일로 전송되었습니다.');
        } catch (error) {
            // 오류 처리
            setError(error.message || '인증 코드 전송에 실패했습니다.');
        } finally {
            // 로딩 상태 종료
            setSendCodeLoading(false);
        }
    };

    /**
     * 폼 유효성 검사 함수
     * 모든 필수 입력 필드가 올바르게 입력되었는지 확인합니다.
     * 
     * @returns {boolean} 유효성 검사 통과 여부
     */
    const validateForm = () => {
        // 이메일 입력 확인
        if (!email) {
            setError('이메일을 입력해주세요.');
            return false;
        }
        
        // 인증 코드 입력 확인
        if (!verificationCode) {
            setError('인증 코드를 입력해주세요.');
            return false;
        }
        
        // 인증 코드 요청 여부 확인
        if (!emailSent) {
            setError('먼저 인증 코드를 요청해주세요.');
            return false;
        }
        
        // 새 비밀번호 입력 확인
        if (!newPassword) {
            setError('새 비밀번호를 입력해주세요.');
            return false;
        }
        
        // 비밀번호 길이 확인
        if (newPassword.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다.');
            return false;
        }
        
        // 비밀번호 일치 확인
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return false;
        }
        
        // 모든 검사 통과
        return true;
    };

    /**
     * 비밀번호 변경 제출 처리 함수
     * 입력된 정보로 비밀번호 변경을 요청합니다.
     */
    const handleSubmit = async () => {
        // 폼 유효성 검사
        if (validateForm()) {
            try {
                // 로딩 상태 시작 및 오류 초기화
                setSubmitLoading(true);
                setError('');
                
                // API 호출하여 비밀번호 변경
                await changePassword({
                    email: email,
                    password: newPassword,
                    code: verificationCode
                });
                
                // 성공 메시지 표시 및 모달 닫기 예약
                setSuccess('비밀번호가 성공적으로 변경되었습니다.');
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } catch (error) {
                // 오류 처리
                setError(error.message || '비밀번호 변경에 실패했습니다.');
            } finally {
                // 로딩 상태 종료
                setSubmitLoading(false);
            }
        }
    };

    /**
     * 모든 상태 초기화 함수
     * 모달 내의 모든 입력값과 상태를 초기 상태로 되돌립니다.
     */
    const handleReset = () => {
        setEmail('');
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setEmailSent(false);
        setSendCodeLoading(false);
        setSubmitLoading(false);
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
        >
            <Box sx={style}>
                {/* 모달 헤더 */}
                <Box sx={{ p: 3, pb: 2 }}>
                    {/* 닫기 버튼 */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* 모달 제목 */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 400,
                            mb: 2
                        }}
                    >
                        비밀번호 변경
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e0e0e0' }} />

                {/* 모달 본문 */}
                <Box sx={{ p: 3 }}>
                    {/* 오류 메시지 표시 */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    {/* 성공 메시지 표시 */}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}
                    
                    {/* 입력 폼 */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3
                    }}>
                        {/* 이메일 입력 및 인증 요청 */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                label="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={emailSent} // 인증 코드 전송 후 수정 불가
                            />
                            <Button
                                variant="contained"
                                onClick={handleSendVerificationCode}
                                disabled={sendCodeLoading || !email || emailSent} // 로딩 중이거나 이메일 없거나 이미 전송된 경우 비활성화
                                sx={{
                                    whiteSpace: 'nowrap',
                                    bgcolor: '#1976d2',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        bgcolor: '#1565c0',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                {sendCodeLoading ? <CircularProgress size={24} /> : '인증 요청'}
                            </Button>
                        </Box>
                        
                        {/* 인증 코드 입력 */}
                        <TextField
                            fullWidth
                            label="인증 코드"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        
                        {/* 새 비밀번호 입력 */}
                        <TextField
                            fullWidth
                            type={showNewPassword ? "text" : "password"} // 비밀번호 표시 여부에 따라 타입 변경
                            label="새 비밀번호"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
                                // 비밀번호 표시/숨김 토글 버튼
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                        >
                                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        {/* 새 비밀번호 확인 */}
                        <TextField
                            fullWidth
                            type={showConfirmPassword ? "text" : "password"} // 비밀번호 표시 여부에 따라 타입 변경
                            label="새 비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                // 비밀번호 표시/숨김 토글 버튼
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </Box>

                {/* 모달 푸터 (버튼 영역) */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    {/* 취소 버튼 */}
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        sx={{
                            color: '#666',
                            borderColor: '#666',
                            boxShadow: 'none'
                        }}
                    >
                        취소
                    </Button>
                    
                    {/* 변경 버튼 */}
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitLoading || !emailSent} // 로딩 중이거나 인증 코드가 전송되지 않은 경우 비활성화
                        sx={{
                            bgcolor: '#1976d2',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#1565c0',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {submitLoading ? <CircularProgress size={24} /> : '변경'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ChangePasswordModal;