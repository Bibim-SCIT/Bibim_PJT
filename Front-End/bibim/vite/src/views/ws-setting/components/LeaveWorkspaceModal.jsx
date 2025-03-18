import { useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Modal, 
    Divider, 
    IconButton 
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { loadWorkspace } from '../../../store/workspaceRedux';
// import { leaveWorkspace } from '../../../api/workspaceApi'; // 나중에 API 연결 시 사용

/**
 * 워크스페이스 탈퇴 확인 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.open - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {Object} props.workspace - 워크스페이스 정보
 * @param {Function} props.onConfirm - 탈퇴 확인 시 호출할 함수
 */
const LeaveWorkspaceModal = ({ open, onClose, workspace, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // 워크스페이스 탈퇴 처리
    const handleLeaveWorkspace = async () => {
        if (!workspace) return;
        
        setLoading(true);
        
        try {
            // 부모 컴포넌트에서 전달받은 확인 함수 호출
            await onConfirm(workspace);
            onClose(); // 모달 닫기
            
            // localStorage에서 activeWorkspace 제거
            localStorage.removeItem('activeWorkspace');
            
            // 전체 페이지 새로고침하면서 워크스페이스 선택 페이지로 이동
            window.location.href = '/ws-select';
        } catch (error) {
            console.error('워크스페이스 탈퇴 오류:', error);
            // 오류 발생 시에도 모달은 닫지 않고 오류 메시지만 표시
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="leave-workspace-modal"
            aria-describedby="leave-workspace-confirmation"
        >
            <Box sx={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 24,
                p: 0,
                position: 'absolute',
                outline: 'none'
            }}>
                <Box sx={{ p: 3, pb: 2 }}>
                    <IconButton
                        onClick={onClose}
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
                        워크스페이스 탈퇴
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e0e0e0' }} />

                <Box sx={{ p: 3 }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <WarningIcon
                            sx={{
                                fontSize: 40,
                                color: '#ff4444',
                                mb: 2
                            }}
                        />
                        <Typography sx={{ mb: 1, textAlign: 'center' }}>
                            {workspace && `'${workspace.name || workspace.wsName}' 워크스페이스에서 정말 탈퇴하시겠습니까?`}
                        </Typography>
                        <Typography
                            color="error"
                            sx={{
                                fontSize: '0.875rem',
                                fontStyle: 'italic',
                                textAlign: 'center'
                            }}
                        >
                            ※ 탈퇴 후에는 다시 초대를 받아야 참여할 수 있습니다.
                        </Typography>
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
                        onClick={onClose}
                        sx={{
                            color: '#666',
                            borderColor: '#666',
                            boxShadow: 'none'
                        }}
                        disabled={loading}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleLeaveWorkspace}
                        sx={{
                            bgcolor: '#ff4444',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#ff0000',
                                boxShadow: 'none'
                            }
                        }}
                        disabled={loading}
                    >
                        {loading ? '처리 중...' : '탈퇴하기'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default LeaveWorkspaceModal; 