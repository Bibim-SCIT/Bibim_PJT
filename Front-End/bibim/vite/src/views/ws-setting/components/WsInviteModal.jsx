import { useState } from 'react';
import { 
    Modal, 
    Box, 
    Typography, 
    Button, 
    TextField,
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { inviteWorkspace } from '../../../api/workspaceApi';

// 모달 스타일 정의
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 24,
    p: 0,
};

export default function WsInviteModal({ open, onClose, workspace }) {
    // 상태 관리
    const [email, setEmail] = useState('');          // 초대할 이메일 주소
    const [loading, setLoading] = useState(false);   // 초대 처리 중 상태
    const [error, setError] = useState('');          // 에러 메시지
    const [isComplete, setIsComplete] = useState(false);  // 초대 완료 상태

    // 초대 메일 전송 처리
    const handleSendInvite = async () => {
        // 이메일 입력 확인
        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // 워크스페이스 초대 API 호출
            await inviteWorkspace(workspace.wsId, email);
            setIsComplete(true);
        } catch (err) {
            setError(err.message || '초대 메일 전송 실패');
        }
        setLoading(false);
    };

    // 모달 닫기 및 상태 초기화
    const handleClose = () => {
        setEmail('');
        setError('');
        setIsComplete(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                {/* 헤더 영역 */}
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
                            mb: 0
                        }}
                    >
                        워크스페이스 초대
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e0e0e0' }} />

                {/* 내용 영역 */}
                <Box sx={{ p: 3 }}>
                    {/* 초대 메일 입력 화면 */}
                    {!isComplete ? (
                        <>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                <Box component="span" sx={{ fontWeight: 600, color: '#4a6cc7' }}>
                                    {workspace?.wsName}
                                </Box>
                                <Box component="span"> 워크스페이스에 초대합니다</Box>
                            </Typography>

                            <TextField
                                fullWidth
                                label="초대할 이메일"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: error ? 1 : 3 }}
                            />
                            {/* 에러 메시지 표시 */}
                            {error && (
                                <Typography variant="caption" color="error" sx={{ mb: 3, display: 'block', ml: 1 }}>
                                    {error}
                                </Typography>
                            )}
                            <Button 
                                variant="contained" 
                                fullWidth 
                                onClick={handleSendInvite} 
                                disabled={loading}
                                sx={{
                                    bgcolor: '#4a6cc7',
                                    boxShadow: 'none',
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        bgcolor: '#3f5ba9',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                {loading ? '전송 중...' : '초대 인증 메일 보내기 📧'}
                            </Button>
                        </>
                    ) : (
                        /* 초대 완료 화면 */
                        <>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                                    초대 메일 전송 완료
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                                    <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                        {email}
                                    </Box>
                                    로 초대 메일이 전송되었습니다.
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    onClick={handleClose}
                                    sx={{
                                        bgcolor: '#4a6cc7',
                                        boxShadow: 'none',
                                        py: 1,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        '&:hover': {
                                            bgcolor: '#3f5ba9',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    확인
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    );
} 