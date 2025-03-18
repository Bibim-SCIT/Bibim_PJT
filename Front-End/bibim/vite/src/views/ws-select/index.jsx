import { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigContext } from '../../contexts/ConfigContext'; // ✅ ConfigContext import
import { loadWorkspace, setActiveWorkspace } from '../../store/workspaceRedux';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Snackbar, Alert } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import WorkspaceList from './components/WorkspaceList';
import InviteWorkspace from './components/InviteWorkspace';
import AcceptInviteModal from './components/AcceptInviteModal'; // 초대 수락 모달 import

import { createWorkspace, joinWorkspaceByInviteCode } from '../../api/workspaceApi';
import LoadingScreen from './components/LoadingScreen';

// ==============================|| 워크스페이스 선택 화면 ||============================== //

export default function WsSelectPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ✅ Context에서 user 정보 가져오기
    const { user } = useContext(ConfigContext);

    // Redux에서 워크스페이스 정보 가져오기
    const workspaces = useSelector((state) => state.workspace.list || []); // ✅ 기본값 설정
    const loading = useSelector((state) => state.workspace.loading);
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const [inviteAcceptModalOpen, setInviteAcceptModalOpen] = useState(false);
    
    // 스낵바 상태 관리
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        console.log("👤 현재 로그인한 사용자:", user);
        console.log("🏢 현재 선택된 워크스페이스:", activeWorkspace);
    }, [user, activeWorkspace]);

    // 새로고침 후에도 선택한 워크스페이스 유지
    useEffect(() => {
        console.log("📌 워크스페이스 목록을 불러오는 중...");
        dispatch(loadWorkspace());

        // 🔥 localStorage에 저장된 activeWorkspace가 있으면 Redux에 적용
        const savedWorkspace = localStorage.getItem('activeWorkspace');
        if (savedWorkspace) {
            const parsedWorkspace = JSON.parse(savedWorkspace);
            console.log("🔄 저장된 activeWorkspace:", parsedWorkspace);
            dispatch(setActiveWorkspace(parsedWorkspace));
        }
        
        // 워크스페이스 나가기 성공 메시지가 있으면 스낵바로 표시
        const leaveSuccessData = localStorage.getItem('workspaceLeaveSuccess');
        if (leaveSuccessData) {
            try {
                const { message, wsName } = JSON.parse(leaveSuccessData);
                setSnackbar({
                    open: true,
                    message: message || '워크스페이스 나가기가 완료되었습니다.',
                    severity: 'success'
                });
                
                // 메시지를 표시한 후 localStorage에서 삭제
                localStorage.removeItem('workspaceLeaveSuccess');
            } catch (error) {
                console.error('워크스페이스 나가기 메시지 처리 오류:', error);
                localStorage.removeItem('workspaceLeaveSuccess');
            }
        }
    }, [dispatch]);

    // 스낵바 닫기 함수
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    useEffect(() => {
        if (!loading && Array.isArray(workspaces) && workspaces.length === 1) {
            handleSelectWorkspace(workspaces[0]);
        }
    }, [loading, workspaces]);

    // 워크스페이스가 없는 경우 확인
    //const [workspaces, setWorkspaces] = useState([]);

    // 새 워크스페이스 생성 (예제)
    // const handleCreateWorkspace = () => {
    //     const newWs = { id: workspaces.length + 1, name: `새 워크스페이스 ${workspaces.length + 1}`, avatar: '/assets/default-ws.png' };
    //     setWorkspaces([...workspaces, newWs]);
    // };

    // 초대 코드 인증 후 워크스페이스 추가
    // const handleInviteWorkspace = (code) => {
    //     setWorkspaces([...workspaces, { id: workspaces.length + 1, name: `초대된 워크스페이스 (${code})`, avatar: '/assets/default-ws.png' }]);
    // };

    // 사용자가 워크스페이스 선택 시 Redux 상태 업데이트 후 페이지 이동
    const handleSelectWorkspace = (workspace) => {
        dispatch(setActiveWorkspace(workspace));
        localStorage.setItem('activeWorkspace', JSON.stringify(workspace)); // ✅ localStorage에 저장
        // navigate('/dashboard/default'); // 워크스페이스 내부 페이지로 이동

    };

    // 새로운 워크스페이스 생성 (API 연동)
    const handleCreateWorkspace = async () => {
        try {
            const newWs = await createWorkspace();
            dispatch(loadWorkspace()); // 새 워크스페이스 목록 불러오기
        } catch (error) {
            console.error('워크스페이스 생성 실패:', error);
        }
    };

    // 초대 코드 입력 후 워크스페이스 가입 & 모달 띄우기
    const handleInviteWorkspace = async (code) => {
        try {
            await joinWorkspaceByInviteCode(code);
            dispatch(loadWorkspace());
            setInviteAcceptModalOpen(true);
        } catch (error) {
            console.error('초대 코드 가입 실패:', error);
        }
    };

    // 로딩 상태일 때 커스텀 로딩 컴포넌트 렌더링
    if (loading) return <LoadingScreen />;

    return (
        <MainCard title="워크스페이스 선택">
            <Grid container spacing={3}>
                {/* 워크스페이스 리스트 */}
                <Grid item xs={12}>
                    <WorkspaceList workspaces={workspaces} onSelect={handleSelectWorkspace} onCreate={handleCreateWorkspace} />
                </Grid>

                {/* 초대 코드 입력 박스 */}
                <Grid item xs={12}>
                    <InviteWorkspace onInvite={handleInviteWorkspace} />
                </Grid>

                <Box sx={{ height: '200px' }}>
                </Box>
            </Grid>
            
            {/* 초대 수락 모달 */}
            <AcceptInviteModal
                open={inviteAcceptModalOpen}
                onClose={() => setInviteAcceptModalOpen(false)}
            />
            
            {/* 스낵바 컴포넌트 */}
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
        </MainCard>
    );
}
