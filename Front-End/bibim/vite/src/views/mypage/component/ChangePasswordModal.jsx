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

const style = {
    // position: 'absolute',
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

const ChangePasswordModal = ({ open, handleClose }) => {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sendCodeLoading, setSendCodeLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleSendVerificationCode = async () => {
        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }

        try {
            setSendCodeLoading(true);
            setError('');
            await sendChangePasswordMail(email);
            setEmailSent(true);
            setSuccess('인증 코드가 이메일로 전송되었습니다.');
        } catch (error) {
            setError(error.message || '인증 코드 전송에 실패했습니다.');
        } finally {
            setSendCodeLoading(false);
        }
    };

    const validateForm = () => {
        if (!email) {
            setError('이메일을 입력해주세요.');
            return false;
        }
        if (!verificationCode) {
            setError('인증 코드를 입력해주세요.');
            return false;
        }
        if (!emailSent) {
            setError('먼저 인증 코드를 요청해주세요.');
            return false;
        }
        if (!newPassword) {
            setError('새 비밀번호를 입력해주세요.');
            return false;
        }
        if (newPassword.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다.');
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                setSubmitLoading(true);
                setError('');
                await changePassword({
                    email: email,
                    password: newPassword,
                    code: verificationCode
                });
                setSuccess('비밀번호가 성공적으로 변경되었습니다.');
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } catch (error) {
                setError(error.message || '비밀번호 변경에 실패했습니다.');
            } finally {
                setSubmitLoading(false);
            }
        }
    };

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
                <Box sx={{ p: 3, pb: 2 }}>
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

                <Box sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}
                    
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
                                disabled={emailSent}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSendVerificationCode}
                                disabled={sendCodeLoading || !email || emailSent}
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
                            type={showNewPassword ? "text" : "password"}
                            label="새 비밀번호"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
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
                            type={showConfirmPassword ? "text" : "password"}
                            label="새 비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
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

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderTop: '1px solid #e0e0e0'
                }}>
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
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitLoading || !emailSent}
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