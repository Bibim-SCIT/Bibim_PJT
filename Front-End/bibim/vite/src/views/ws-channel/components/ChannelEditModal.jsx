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
import { updateChannelName, deleteChannel } from "../../../api/channel";

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

function ChannelEditModal({ open, onClose, workspaceId, channelId, currentName, onUpdate, onDelete }) {
    const [newName, setNewName] = useState("");
    const [isChanging, setIsChanging] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

    const handleSave = async () => {
        if (!newName.trim() || isChanging) return;

        setIsChanging(true);
        try {
            await updateChannelName(workspaceId, channelId, newName);
            
            // 성공 알림 표시
            setSnackbar({
                open: true,
                message: '채널 이름이 성공적으로 변경되었습니다.',
                severity: 'success'
            });
            
            onUpdate(channelId, newName);

            // 약간의 지연 후 모달 닫기 (알림이 보이도록)
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error("채널 수정 오류:", error);
            
            // 실패 알림 표시
            setSnackbar({
                open: true,
                message: `채널 이름 변경 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`,
                severity: 'error'
            });
        } finally {
            setIsChanging(false);
        }
    };

    // 채널 삭제 확인 모달 열기
    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    // 채널 삭제 처리
    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setDeleteConfirmOpen(false);
        try {
            await deleteChannel(workspaceId, channelId);
            
            // 성공 알림 표시
            setSnackbar({
                open: true,
                message: '채널이 성공적으로 삭제되었습니다.',
                severity: 'success'
            });
            
            onDelete(channelId);
            
            // 약간의 지연 후 모달 닫기 (알림이 보이도록)
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error("채널 삭제 오류:", error);
            
            // 실패 알림 표시
            setSnackbar({
                open: true,
                message: `채널 삭제 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`,
                severity: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // 모달 닫기 및 상태 초기화
    const handleClose = () => {
        setNewName("");
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
                            채널 관리
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: '#e0e0e0' }} />

                    {/* 내용 영역 */}
                    <Box sx={{ p: 3 }}>
                        {/* 현재 채널 정보 표시 */}
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            현재 채널: <Box component="span" sx={{ fontWeight: 600, color: '#4a6cc7' }}>{currentName}</Box>
                        </Typography>

                        {/* 채널 이름 변경 필드 */}
                        <TextField
                            fullWidth
                            label="새 채널 이름"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            disabled={isChanging}
                            sx={{ mb: 3 }}
                            placeholder="새 채널 이름을 입력해주세요"
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                            <Button 
                                onClick={handleDeleteClick} 
                                color="error" 
                                variant="outlined"
                                disabled={isDeleting}
                                sx={{
                                    px: 2,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        bgcolor: 'rgba(211,47,47,0.04)'
                                    }
                                }}
                            >
                                {isDeleting ? "삭제 중..." : "채널 삭제"}
                            </Button>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
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
                                    onClick={handleSave} 
                                    disabled={isChanging || !newName.trim()}
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
                                    {isChanging ? "저장 중..." : "저장"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* 삭제 확인 모달 */}
            <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <Box sx={{
                    ...modalStyle,
                    width: 350
                }}>
                    {/* 헤더 영역 */}
                    <Box sx={{ p: 3, pb: 2 }}>
                        <IconButton
                            onClick={() => setDeleteConfirmOpen(false)}
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
                            채널 삭제 확인
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: '#e0e0e0' }} />

                    {/* 내용 영역 */}
                    <Box sx={{ p: 3 }}>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            정말로 "<Box component="span" sx={{ fontWeight: 600, color: '#4a6cc7' }}>{currentName}</Box>" 채널을 삭제하시겠습니까?
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => setDeleteConfirmOpen(false)}
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
                                아니오
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleDeleteConfirm} 
                                color="error"
                                disabled={isDeleting}
                                sx={{
                                    boxShadow: 'none',
                                    px: 2,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                {isDeleting ? "삭제 중..." : "예, 삭제합니다"}
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

export default ChannelEditModal;
