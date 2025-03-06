import { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import { inviteWorkspace } from '../../../api/workspaceApi';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default function WsInviteModal({ open, onClose, workspace }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    const handleSendInvite = async () => {
        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await inviteWorkspace(workspace.wsId, email);
            setIsComplete(true);
        } catch (err) {
            setError(err.message || '초대 메일 전송 실패');
        }
        setLoading(false);
    };

    const handleClose = () => {
        setEmail('');
        setError('');
        setIsComplete(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                {!isComplete ? (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {workspace?.wsName} 워크스페이스 초대
                        </Typography>
                        <TextField
                            fullWidth
                            label="초대할 이메일"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        {error && (
                            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <Button variant="contained" fullWidth onClick={handleSendInvite} disabled={loading}>
                            {loading ? '전송 중...' : '초대인증 메일 보내기 📧'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            초대 메일 전송 완료
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {email}로 초대 메일이 전송되었습니다.
                        </Typography>
                        <Button variant="contained" fullWidth onClick={handleClose}>
                            확인
                        </Button>
                    </>
                )}
            </Box>
        </Modal>
    );
} 