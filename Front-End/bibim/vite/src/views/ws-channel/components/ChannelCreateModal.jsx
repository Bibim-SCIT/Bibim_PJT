import React, { useState } from "react";
import { 
    Modal,
    Box,
    Typography, 
    TextField, 
    Button,
    IconButton,
    Divider,
    Snackbar,
    Alert
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { createChannel } from "../../../api/channel";
import { useSelector } from 'react-redux';

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
    outline: 'none'
};

function ChannelCreateModal({ open, onClose, onChannelCreated }) {
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const WSID = activeWorkspace.wsId;

    const [channelName, setChannelName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 스낵바 닫기 핸들러
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    const handleCreate = async () => {
        if (!channelName.trim() || isCreating) return;

        setIsCreating(true);
        
        try {
            console.log("생성할 웤스번호", WSID);
            const newChannel = await createChannel(WSID, channelName);
            console.log("확인하기", newChannel);

            if (!newChannel) {
                throw new Error("채널 생성 실패: 유효한 채널 ID가 없습니다.");
            }

            console.log("새로운 채널 생성 완료:", newChannel);
            
            // 성공 알림 표시
            setSnackbar({
                open: true,
                message: '채널이 성공적으로 생성되었습니다.',
                severity: 'success'
            });

            onChannelCreated(newChannel.channelId, newChannel.channelName);

            // 약간의 지연 후 모달 닫기 (알림이 보이도록)
            setTimeout(() => {
                setChannelName("");
                onClose();
            }, 1000);
        } catch (error) {
            console.error("채널 생성 오류:", error);
            // 실패 알림 표시
            setSnackbar({
                open: true,
                message: `채널 생성 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`,
                severity: 'error'
            });
        } finally {
            setIsCreating(false);
        }
    };

    // 모달 닫기 및 상태 초기화
    const handleClose = () => {
        setChannelName("");
        setSnackbar({
            open: false,
            message: '',
            severity: 'success'
        });
        onClose();
    };

    return (
        <>
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
                            새 채널 생성
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: '#e0e0e0' }} />

                    {/* 내용 영역 */}
                    <Box sx={{ p: 3 }}>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            <Box component="span" sx={{ fontWeight: 600, color: '#4a6cc7' }}>
                                {activeWorkspace?.wsName}
                            </Box>
                            <Box component="span"> 워크스페이스에 새 채널을 생성합니다</Box>
                        </Typography>
                        
                        <TextField
                            fullWidth
                            label="채널 이름"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            disabled={isCreating}
                            sx={{ mb: 3 }}
                            placeholder="채널 이름을 입력해주세요"
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button 
                                variant="outlined" 
                                onClick={handleClose}
                                sx={{
                                    px: 2,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    borderColor: '#e0e0e0',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: '#bdbdbd',
                                        bgcolor: 'rgba(0,0,0,0.01)'
                                    }
                                }}
                            >
                                취소
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleCreate} 
                                disabled={isCreating}
                                sx={{
                                    bgcolor: '#4a6cc7',
                                    boxShadow: 'none',
                                    px: 2,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        bgcolor: '#3f5ba9',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                {isCreating ? '생성 중...' : '생성하기'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
            
            {/* 알림 메시지 표시 */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
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
        </>
    );
}

export default ChannelCreateModal;
