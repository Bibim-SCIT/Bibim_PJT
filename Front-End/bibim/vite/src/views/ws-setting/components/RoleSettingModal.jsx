import { Box, Modal, Typography, Avatar, Button, Select, MenuItem } from '@mui/material';
import { updateUserRole } from '../../../api/workspaceApi';

const RoleSettingModal = ({ open, onClose, selectedUser, selectedRole, onRoleChange, onSave, workspaceId }) => {
    const handleSaveRole = async () => {
        try {
            await updateUserRole(workspaceId, selectedUser.email, selectedRole);
            onSave(); // 성공 시 부모 컴포넌트의 콜백 실행
        } catch (error) {
            console.error('권한 변경 실패:', error);
            // 여기에 에러 처리 로직 추가 가능 (예: 알림 표시)
        }
    };

    return (
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
                {selectedUser && (
                    <Box>
                        <Typography sx={{ mb: 2, color: '#666' }}>
                            사용자의 권한을 설정합니다.
                        </Typography>
                        <Box sx={{ 
                            bgcolor: '#f8f9fa',
                            p: 2,
                            borderRadius: 1
                        }}>
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
                                <MenuItem value="member">멤버</MenuItem>
                            </Select>
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
                        onClick={handleSaveRole}
                        sx={{
                            bgcolor: '#4a6cc7',
                            '&:hover': { bgcolor: '#3f5ba9' }
                        }}
                    >
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default RoleSettingModal; 