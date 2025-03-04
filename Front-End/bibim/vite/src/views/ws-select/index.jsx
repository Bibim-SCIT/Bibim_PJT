import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigContext } from '../../contexts/ConfigContext'; // ✅ ConfigContext import
import { loadWorkspace, setActiveWorkspace } from '../../store/workSpaceRedux';
import { useNavigate } from 'react-router-dom';
import { Grid, Box } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import WorkspaceList from './components/WorkspaceList';
import InviteWorkspace from './components/InviteWorkspace';

import { createWorkspace, joinWorkspaceByInviteCode } from '../../api/workspaceApi';

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

    useEffect(() => {
        console.log("👤 현재 로그인한 사용자:", user);
        console.log("🏢 현재 선택된 워크스페이스:", activeWorkspace);
    }, [user, activeWorkspace]);

    // useEffect(() => {
    //     dispatch(loadWorkspace());
    // }, [dispatch]);

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
    }, [dispatch]);


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
        navigate('/dashboard/default'); // 워크스페이스 내부 페이지로 이동
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

    // 초대 코드 입력 후 워크스페이스 가입
    const handleInviteWorkspace = async (code) => {
        try {
            await joinWorkspaceByInviteCode(code);
            dispatch(loadWorkspace()); // 업데이트된 워크스페이스 목록 불러오기
        } catch (error) {
            console.error('초대 코드 가입 실패:', error);
        }
    };

    // 로그인 후 자동 리디렉션: 워크스페이스가 1개만 있으면 자동 선택
    // useEffect(() => {
    //     if (!loading && workspaces.length === 1) {
    //         handleSelectWorkspace(workspaces[0]);
    //     }
    // }, [loading, workspaces]);

    // ✅ workspaces가 undefined인 경우 빈 배열로 처리하여 오류 방지
    useEffect(() => {
        if (!loading && Array.isArray(workspaces) && workspaces.length === 1) {
            handleSelectWorkspace(workspaces[0]);
        }
    }, [loading, workspaces]);

    if (loading) return <p>워크스페이스 로딩 중...</p>;

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
        </MainCard>
    );
}
