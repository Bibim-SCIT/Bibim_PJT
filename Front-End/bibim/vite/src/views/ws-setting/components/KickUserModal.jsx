import { Box, Modal, Typography, Avatar, Button } from '@mui/material';
import { useState } from 'react';

// 워크스페이스 멤버 강퇴 확인 모달 컴포넌트
const KickUserModal = ({ open, onClose, selectedUser, onConfirm, formatDate }) => {
    // 강퇴 처리 중 상태
    const [loading, setLoading] = useState(false);

    // 강퇴 확인 처리 함수
    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();  // 부모 컴포넌트의 강퇴 처리 함수 호출
        } finally {
            setLoading(false);
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
                {/* 선택된 사용자 정보 표시 */}
                {selectedUser && (
                    <Box>
                        <Typography sx={{ mb: 2, color: '#666' }}>
                            다음 유저를 워크스페이스에서 강퇴하시겠습니까?
                        </Typography>
                        {/* 사용자 상세 정보 */}
                        <Box sx={{ 
                            bgcolor: '#f8f9fa',
                            p: 2,
                            borderRadius: 1
                        }}>
                            {/* 프로필 이미지와 닉네임 */}
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
                            {/* 이메일과 마지막 로그인 시간 */}
                            <Typography sx={{ mb: 0.5 }}>
                                이메일: {selectedUser.email}
                            </Typography>
                            <Typography>
                                마지막 로그인: {formatDate(selectedUser.lastActiveTime)}
                            </Typography>
                        </Box>
                    </Box>
                )}
                {/* 버튼 영역 */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1,
                    mt: 3 
                }}>
                    <Button 
                        onClick={onClose}
                        sx={{ color: '#666' }}
                        disabled={loading}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading}
                        sx={{
                            bgcolor: '#e53935',
                            '&:hover': { bgcolor: '#d32f2f' }
                        }}
                    >
                        {loading ? '강퇴 중...' : '강퇴하기'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default KickUserModal; 