import { Box, Modal, Typography, Avatar, Button } from '@mui/material';
import { kickUserFromWorkspace } from '../../../api/workspaceApi';

const KickUserModal = ({ open, onClose, selectedUser, onConfirm, formatDate, workspaceId }) => {
    const handleKickUser = async () => {
        try {
            await kickUserFromWorkspace(workspaceId, selectedUser.email);
            onConfirm(); // 성공 시 부모 컴포넌트의 콜백 실행
        } catch (error) {
            console.error('사용자 강퇴 실패:', error);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="kick-user-modal"
            aria-describedby="kick-user-confirmation"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
            }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    강퇴 확인
                </Typography>
                {selectedUser && (
                    <Box>
                        <Typography sx={{ mb: 2, color: '#666' }}>
                            다음 유저를 워크스페이스에서 강퇴하시겠습니까?
                        </Typography>
                        <Box sx={{ 
                            bgcolor: '#f8f9fa',
                            p: 2,
                            borderRadius: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Avatar 
                                    src={selectedUser.profileImage} 
                                    sx={{ 
                                        width: 32, 
                                        height: 32,
                                        bgcolor: '#e0e0e0'
                                    }}
                                >
                                    {selectedUser.nickname[0]}
                                </Avatar>
                                <Typography>
                                    닉네임: {selectedUser.nickname}
                                </Typography>
                            </Box>
                            <Typography sx={{ mb: 0.5 }}>
                                이메일: {selectedUser.email}
                            </Typography>
                            <Typography>
                                마지막 로그인: {formatDate(selectedUser.lastActiveTime)}
                            </Typography>
                        </Box>
                    </Box>
                )}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1,
                    mt: 3 
                }}>
                    <Button 
                        onClick={onClose}
                        sx={{ color: '#666' }}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleKickUser}
                        sx={{
                            bgcolor: '#e53935',
                            '&:hover': { bgcolor: '#d32f2f' }
                        }}
                    >
                        강퇴하기
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default KickUserModal; 