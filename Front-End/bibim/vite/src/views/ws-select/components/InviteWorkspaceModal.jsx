// src/views/ws-select/components/InviteWorkspaceModal.jsx
import { useState } from 'react';
import { Modal, Box, Typography, Avatar, Button, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
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

export default function InviteWorkspaceModal({ open, onClose }) {
    const [step, setStep] = useState(1);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redux에서 워크스페이스 목록 가져오기
    const workspaces = useSelector((state) => state.workspace.list || []);

    // 1단계: 워크스페이스 선택
    const handleWorkspaceSelect = (workspace) => {
        setSelectedWorkspace(workspace);
        setStep(2);
    };

    // 2단계: 이메일 입력 후 초대 메일 전송
    const handleSendInvite = async () => {
        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await inviteWorkspace(selectedWorkspace.wsId, email);
            setStep(3);
        } catch (err) {
            setError(err.message || '초대 메일 전송 실패');
        }
        setLoading(false);
    };

    // 모달 닫기 및 상태 초기화
    const handleClose = () => {
        setStep(1);
        setSelectedWorkspace(null);
        setEmail('');
        setError('');
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                {step === 1 && (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            초대할 워크스페이스 선택
                        </Typography>
                        {workspaces.length > 0 ? (
                            workspaces.map((ws) => (
                                <Box
                                    key={ws.wsId}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        p: 1,
                                        borderBottom: '1px solid #eee',
                                    }}
                                    onClick={() => handleWorkspaceSelect(ws)}
                                >
                                    <Avatar
                                        src={ws.wsImg}
                                        sx={{ width: 40, height: 40, mr: 2 }}
                                        variant="rounded"
                                    />
                                    <Typography variant="body1">{ws.wsName}</Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2">워크스페이스가 없습니다.</Typography>
                        )}
                    </>
                )}

                {step === 2 && (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {selectedWorkspace?.wsName} 워크스페이스 초대
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
                )}

                {step === 3 && (
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
