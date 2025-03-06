import { Box, Modal, Typography, Avatar, Button, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';
import { updateUserRole } from '../../../api/workspaceApi';

// 워크스페이스 멤버 권한 설정 모달 컴포넌트
const RoleSettingModal = ({ open, onClose, selectedUser, selectedRole, onRoleChange, onSave, workspaceId }) => {
    // 상태 관리
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 권한 저장 처리 함수
    const handleSaveRole = async () => {
        setLoading(true);
        setError('');
        try {
            await updateUserRole(workspaceId, selectedUser.email, selectedRole);
            onSave();
            setSnackbar({
                open: true,
                message: '권한이 성공적으로 변경되었습니다.',
                severity: 'success'
            });
            onClose();
        } catch (error) {
            console.error('권한 변경 실패:', error);
            setError(error.response?.data?.message || '권한 변경에 실패했습니다.');
            setSnackbar({
                open: true,
                message: error.response?.data?.message || '권한 변경에 실패했습니다.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // 스낵바 닫기 핸들러
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="role-setting-modal"
                aria-describedby="role-setting-description"
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
                        권한 설정
                    </Typography>
                    {/* 선택된 사용자 정보 표시 */}
                    {selectedUser && (
                        <Box>
                            <Typography sx={{ mb: 2, color: '#666' }}>
                                사용자의 권한을 설정합니다.
                            </Typography>
                            {/* 사용자 상세 정보 및 권한 선택 */}
                            <Box sx={{ 
                                bgcolor: '#f8f9fa',
                                p: 2,
                                borderRadius: 1
                            }}>
                                {/* 프로필 이미지와 사용자 정보 */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                                    <Box>
                                        <Typography component="span">
                                            {selectedUser.nickname}
                                        </Typography>
                                        <Typography 
                                            component="span" 
                                            sx={{ 
                                                color: '#999',
                                                ml: 0.5
                                            }}
                                        >
                                            ({selectedUser.email})
                                        </Typography>
                                    </Box>
                                </Box>
                                {/* 권한 선택 드롭다운 */}
                                <Select
                                    fullWidth
                                    size="small"
                                    value={selectedRole}
                                    onChange={onRoleChange}
                                    sx={{
                                        bgcolor: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#e0e0e0'
                                        }
                                    }}
                                >
                                    <MenuItem value="owner">오너</MenuItem>
                                    <MenuItem value="user">멤버</MenuItem>
                                </Select>
                            </Box>
                        </Box>
                    )}
                    {/* 에러 메시지 표시 */}
                    {error && (
                        <Typography 
                            color="error" 
                            sx={{ mt: 2, mb: 1, fontSize: '0.875rem' }}
                        >
                            {error}
                        </Typography>
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
                            onClick={handleSaveRole}
                            disabled={loading}
                            sx={{
                                bgcolor: '#4a6cc7',
                                '&:hover': { bgcolor: '#3f5ba9' }
                            }}
                        >
                            {loading ? '저장 중...' : '저장'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* 알림 스낵바 */}
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
        </>
    );
};

export default RoleSettingModal; 