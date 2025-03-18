import { Box, Typography, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import WsBasicSetting from './components/WsBasicSetting';
import WsUserRoleManagement from './components/WsUserRoleManagement';
import LeaveWorkspaceModal from './components/LeaveWorkspaceModal';
// project imports
import { leaveWorkspace } from '../../api/workspaceApi';
import { getMyWorkspaces } from '../../api/mypage';
import { loadWorkspace } from '../../store/workspaceRedux';

const WsSettingPage = () => {
    const { wsId } = useParams(); // URL에서 워크스페이스 ID 가져오기
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [workspace, setWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Redux에서 워크스페이스 정보 가져오기
    const workspaceList = useSelector((state) => state.workspace.list);
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const reduxLoading = useSelector((state) => state.workspace.loading);
    
    // 스낵바 상태 관리
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 컴포넌트 마운트 시 워크스페이스 목록 불러오기
    useEffect(() => {
        dispatch(loadWorkspace());
    }, [dispatch]);

    // 워크스페이스 목록이 로드되면 현재 워크스페이스 찾기
    useEffect(() => {
        if (reduxLoading) {
            setLoading(true);
            return;
        }
        
        setLoading(true);
        
        // URL의 wsId와 일치하는 워크스페이스 찾기
        if (wsId && workspaceList && workspaceList.length > 0) {
            const currentWorkspace = workspaceList.find(ws => ws.wsId === wsId);
            
            if (currentWorkspace) {
                console.log('현재 워크스페이스:', currentWorkspace);
                setWorkspace(currentWorkspace);
            } else {
                console.error('해당 ID의 워크스페이스를 찾을 수 없습니다:', wsId);
                // 오류 메시지 표시
                setSnackbar({
                    open: true,
                    message: '워크스페이스 정보를 찾을 수 없습니다.',
                    severity: 'error'
                });
                
                // 워크스페이스 목록이 있지만 현재 ID와 일치하는 것이 없는 경우
                // 첫 번째 워크스페이스로 리다이렉트
                if (workspaceList.length > 0) {
                    navigate(`/workspace/${workspaceList[0].wsId}/settings`);
                }
            }
        } else if (!wsId && activeWorkspace) {
            // wsId가 없지만 활성화된 워크스페이스가 있는 경우
            setWorkspace(activeWorkspace);
        } else if (workspaceList && workspaceList.length > 0) {
            // wsId도 없고 활성화된 워크스페이스도 없지만 목록은 있는 경우
            // 첫 번째 워크스페이스 사용
            setWorkspace(workspaceList[0]);
        } else {
            // 워크스페이스 정보가 없는 경우 (개발 중에만 사용)
            setWorkspace({
                wsId: wsId || 'ws-123',
                wsName: '프로젝트 워크스페이스 (임시)'
            });
        }
        
        setLoading(false);
    }, [wsId, workspaceList, activeWorkspace, reduxLoading, navigate]);

    // 탈퇴 모달 열기/닫기
    const handleOpenLeaveModal = () => setLeaveModalOpen(true);
    const handleCloseLeaveModal = () => setLeaveModalOpen(false);

    // 스낵바 닫기 함수
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // 워크스페이스 탈퇴 처리 함수
    const handleLeaveWorkspace = async (workspace) => {
        try {
            if (!workspace) return Promise.reject(new Error('워크스페이스 정보가 없습니다.'));
            
            console.log('워크스페이스 탈퇴 시도:', workspace.wsId);
            const result = await leaveWorkspace(workspace.wsId);
            console.log('워크스페이스 탈퇴 결과:', result);
            
            // 탈퇴 성공 시 즉시 워크스페이스 선택 페이지로 이동
            navigate('/workspace');
            
            return Promise.resolve();
        } catch (error) {
            console.error('워크스페이스 탈퇴 오류:', error);
            setSnackbar({
                open: true,
                message: '워크스페이스 탈퇴 중 오류가 발생했습니다.',
                severity: 'error'
            });
            
            return Promise.reject(error);
        }
    };

    // 로딩 중이거나 워크스페이스 정보가 없는 경우 로딩 표시
    if (loading || reduxLoading) {
        return (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>워크스페이스 정보를 불러오는 중...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ 
                maxWidth: '100%',
                p: { xs: 1.5, sm: 2 }
            }}>
                {/* 1. 워크스페이스 기본 정보 컴포넌트 */}
                <Box sx={{ 
                    mb: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}>
                    <WsBasicSetting workspace={workspace} />
                </Box>

                {/* 2. 권한 관리 컴포넌트 */}
                <Box sx={{ 
                    mb: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}>
                    <Box sx={{ 
                        px: 3,
                        py: 2.5,
                    }}>
                        <Typography sx={{ 
                            fontSize: '18px',
                            fontWeight: 500
                        }}>
                            사용자 및 권한 관리
                        </Typography>
                    </Box>
                    <WsUserRoleManagement workspace={workspace} />
                </Box>

                {/* 3. 워크스페이스 나가기 버튼 */}
                <Box sx={{ 
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    p: 3
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end'
                    }}>
                        <Button 
                            variant="outlined" 
                            sx={{
                                color: '#ff4444',
                                borderColor: '#ff4444',
                                '&:hover': {
                                    borderColor: '#ff0000',
                                    backgroundColor: 'rgba(255, 68, 68, 0.04)'
                                }
                            }}
                            onClick={handleOpenLeaveModal}
                        >
                            워크스페이스 나가기
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* 워크스페이스 탈퇴 모달 */}
            <LeaveWorkspaceModal
                open={leaveModalOpen}
                onClose={handleCloseLeaveModal}
                workspace={workspace}
                onConfirm={handleLeaveWorkspace}
            />

            {/* 스낵바 컴포넌트 */}
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
        </Box>
    );
};

export default WsSettingPage;
