import { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Modal,
    Divider,
    CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { deleteWorkspace } from '../../../api/workspaceApi';
import { useNavigate } from 'react-router-dom';

/**
 * 워크스페이스 삭제 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.open - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {Object} props.workspace - 워크스페이스 정보 (옵션)
 */
const WsDelete = ({ open, onClose, workspace: propWorkspace }) => {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // 임시 워크스페이스 데이터 (props로 전달되지 않은 경우 사용)
    const defaultWorkspace = {
        wsId: 'ws-123',
        wsName: '프로젝트 워크스페이스'
    };
    
    // props로 전달된 워크스페이스 또는 기본값 사용
    const workspace = propWorkspace || defaultWorkspace;

    // 입력 텍스트 변경 핸들러
    const handleTextChange = (e) => {
        setConfirmText(e.target.value);
        setError('');
    };

    // 삭제 확인 검증
    const isDeleteConfirmed = () => {
        // 워크스페이스 이름 필드가 wsName 또는 name인 경우 모두 처리
        const workspaceName = workspace?.wsName || workspace?.name;
        return confirmText === workspaceName;
    };

    // 워크스페이스 삭제 처리
    const handleDelete = async () => {
        if (!isDeleteConfirmed()) {
            setError('워크스페이스 이름이 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        
        try {
            // 워크스페이스 ID 필드가 wsId 또는 id인 경우 모두 처리
            const workspaceId = workspace?.wsId || workspace?.id;
            console.log('워크스페이스 삭제 요청:', workspaceId);
            
            const result = await deleteWorkspace(workspaceId);
            console.log('워크스페이스 삭제 결과:', result);
            
            onClose(); // 모달 닫기
            
            // 삭제 성공 메시지 표시
            alert('워크스페이스가 성공적으로 삭제되었습니다.');
            
            // 워크스페이스 선택 페이지로 이동
            navigate('/workspace');
        } catch (error) {
            console.error('워크스페이스 삭제 실패:', error);
            setError('워크스페이스 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setConfirmText('');
        setError('');
        onClose();
    };

    // 워크스페이스 이름 (wsName 또는 name 필드 사용)
    const workspaceName = workspace?.wsName || workspace?.name;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="workspace-delete-modal"
            aria-describedby="workspace-delete-confirmation"
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
                overflow: 'hidden'
            }}>
                {/* 모달 헤더 */}
                <Box sx={{ p: 3 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 400,
                            fontSize: '1.25rem'
                        }}
                    >
                        워크스페이스 삭제
                    </Typography>
                </Box>
                
                <Divider />
                
                {/* 모달 내용 */}
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
                            '{workspaceName}' 워크스페이스를 정말 삭제하시겠습니까?
                        </Typography>
                        <Typography
                            color="error"
                            sx={{
                                fontSize: '0.875rem',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                mb: 2
                            }}
                        >
                            ※ 삭제 후에는 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                        </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        삭제를 확인하려면 아래에 워크스페이스 이름을 입력하세요:
                    </Typography>
                    
                    <Box sx={{ 
                        bgcolor: '#f8f9fa',
                        p: 2,
                        borderRadius: 1,
                        mb: 2
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {workspaceName}
                        </Typography>
                    </Box>
                    
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="워크스페이스 이름 입력"
                        value={confirmText}
                        onChange={handleTextChange}
                        error={!!error}
                        helperText={error}
                        size="small"
                        sx={{ mb: 1 }}
                    />
                </Box>
                
                {/* 버튼 영역 */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <Button 
                        onClick={handleClose}
                        sx={{
                            color: '#666',
                            borderColor: '#666',
                            boxShadow: 'none'
                        }}
                        variant="outlined"
                        disabled={loading}
                    >
                        취소
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleDelete}
                        disabled={!isDeleteConfirmed() || loading}
                        sx={{
                            bgcolor: '#ff4444',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#ff0000',
                                boxShadow: 'none'
                            },
                            '&.Mui-disabled': {
                                bgcolor: '#ffcccc',
                                color: 'white'
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                삭제 중...
                            </>
                        ) : '삭제하기'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default WsDelete;
