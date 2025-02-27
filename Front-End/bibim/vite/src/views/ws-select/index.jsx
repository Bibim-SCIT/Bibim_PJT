// material-ui
import { useState } from 'react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadWorkspace, setActiveWorkspace } from '../../store/workSpaceRedux';
import { useNavigate } from 'react-router-dom';
import { Grid, Box } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import WorkspaceList from './components/WorkspaceList';
import InviteWorkspace from './components/InviteWorkspace';

import { createWorkspace, joinWorkspaceByInviteCode } from '../../api/workspaceApi';

// 임시 워크스페이스 이미지
// import vaultBoy from 'assets/images/ws/볼트보이.jpg';
// import overwatch from 'assets/images/ws/오버워치.jpg';
// import reactLogo from 'assets/images/ws/리액트.png';
// import pubao from 'assets/images/ws/pubao.jpg';
// import whitley from 'assets/images/ws/휘틀리.jpg';
// import gta6 from 'assets/images/ws/gta6.jpg';
// import atomic from 'assets/images/ws/atomic.jpg';

// ==============================|| 워크스페이스 선택 화면 ||============================== //

export default function WsSelectPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux에서 워크스페이스 데이터 가져오기
    // const { data: workspaces, activeWorkspace, loading } = useSelector((state) => state.workspace);

    // useEffect(() => {
    //     dispatch(loadWorkspace());
    // }, [dispatch]);
    const workspaces = useSelector((state) => state.workspace.list || []); // ✅ 기본값 설정
    const loading = useSelector((state) => state.workspace.loading);

    useEffect(() => {
        dispatch(loadWorkspace());
    }, [dispatch]);



    // 현재 사용자가 속한 워크스페이스 목록 (예제 데이터)
    // const [workspaces, setWorkspaces] = useState([
    //     { id: 1, name: '프로젝트 A', avatar: vaultBoy },
    //     { id: 2, name: '팀 B', avatar: overwatch },
    //     { id: 3, name: '프론트엔드 스터디', avatar: reactLogo },
    //     { id: 4, name: '일본어 워크', avatar: pubao },
    //     { id: 5, name: '게임모임', avatar: whitley },
    //     { id: 6, name: 'GTA', avatar: gta6 },
    //     { id: 7, name: '라스트워크', avatar: atomic }
    // ]);

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
        navigate('/dashboard'); // 워크스페이스 내부 페이지로 이동
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
