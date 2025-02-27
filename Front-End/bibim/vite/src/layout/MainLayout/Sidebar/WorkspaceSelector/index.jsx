/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Tooltip, Button, Menu, MenuItem, Modal, TextField } from '@mui/material';
import useConfig from 'hooks/useConfig';
import { useDispatch, useSelector } from 'react-redux';
import { loadWorkspace } from 'store/workspaceRedux';
import CreateWorkspaceModal from '../../../../views/ws-select/components/CreateWorkspaceModal';

// ✅ 모달창의 스타일 설정
// const modalStyle = {
//     position: 'absolute', // 화면 중앙에 모달을 배치
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)', // 정확히 중앙에 위치하도록 조정
//     width: 400,
//     bgcolor: 'background.paper', // 배경색
//     boxShadow: 24,
//     p: 4,
//     borderRadius: 2 // 모서리를 둥글게 설정
// };

const WorkspaceSelector = () => {
    const dispatch = useDispatch(); // Redux의 dispatch 함수 사용
    const { miniDrawer } = useConfig(); // 사이드바가 최소화되었는지 여부 가져오기

    // ✅ Redux에서 워크스페이스 목록 및 로딩 상태 가져오기
    const workspaces = useSelector((state) => state.workspace.data || []); // 워크스페이스 목록 (없으면 빈 배열 반환)
    const loading = useSelector((state) => state.workspace.loading); // 로딩 상태 가져오기

    // ✅ 현재 선택된 워크스페이스 상태
    const [workspace, setWorkspace] = useState(null);

    // ✅ 메뉴 열기 상태 및 Anchor 요소 관리
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl); // 메뉴가 열려있는지 여부

    // ✅ 모달창 상태 관리
    const [modalOpen, setModalOpen] = useState(false);

    // ✅ 모달창 입력 필드 상태 관리
    // const [newWorkspaceName, setNewWorkspaceName] = useState('');

    // ✅ 컴포넌트가 처음 렌더링될 때 Redux에서 데이터 가져오기
    useEffect(() => {
        dispatch(loadWorkspace()); // loadWorkspace 액션을 실행하여 워크스페이스 목록 불러오기
    }, [dispatch]); // dispatch가 변경될 때마다 실행 (일반적으로 한 번만 실행됨)

    // ✅ 메뉴 버튼 클릭 시 메뉴 열기
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget); // 클릭한 버튼의 요소를 Anchor 요소로 설정하여 메뉴를 해당 위치에 열기
    };

    // ✅ 워크스페이스를 선택했을 때 실행되는 함수
    const handleSelect = (selectedWorkspace) => {
        setWorkspace(selectedWorkspace); // 선택된 워크스페이스를 상태에 저장
        setAnchorEl(null); // 메뉴 닫기
    };

    // ✅ 모달창 열기
    // const handleOpenModal = () => {
    //     setModalOpen(true); // 모달 열기
    //     setAnchorEl(null); // 메뉴 닫기 (선택 메뉴에서 버튼을 클릭했을 때 메뉴가 닫히도록 처리)
    // };

    // ✅ 모달창 닫기
    // const handleCloseModal = () => {
    //     setModalOpen(false); // 모달 닫기
    //     setNewWorkspaceName(''); // 입력 필드 초기화
    // };

    // ✅ 워크스페이스 생성 버튼 클릭 시 실행되는 함수
    const handleCreateWorkspace = () => {
        console.log('새로운 워크스페이스 생성:', newWorkspaceName); // 콘솔에 입력된 워크스페이스 이름 출력
        handleCloseModal(); // 모달창 닫기
    };

    return (
        <Box
            sx={{
                display: 'flex', // Flexbox 레이아웃 사용
                alignItems: 'center', // 세로 중앙 정렬
                p: 2,
                flexDirection: miniDrawer ? 'column' : 'row', // 사이드바가 최소화되면 세로, 아니면 가로 배치
                justifyContent: miniDrawer ? 'center' : 'space-between' // 사이드바 상태에 따라 정렬 방식 변경
            }}
        >
            {/* ✅ 현재 선택된 워크스페이스 이미지 표시 (없을 경우 기본 이미지 표시) */}
            <Tooltip title={workspace ? workspace.wsName : '워크스페이스 선택'} placement="right">
                <Avatar
                    src={workspace ? workspace.wsImg : 'https://via.placeholder.com/40'} // 이미지가 없을 경우 기본 이미지 사용
                    alt={workspace ? workspace.wsName : '워크스페이스 선택'}
                    sx={{ width: 40, height: 40, cursor: 'pointer', mb: miniDrawer ? 1 : 0 }} // 이미지 크기 및 커서 스타일 설정
                />
            </Tooltip>

            {/* ✅ 사이드바가 열렸을 때만 버튼 표시 */}
            {!miniDrawer && (
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                    {/* ✅ 로딩 상태일 때 표시 */}
                    {loading ? (
                        <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'gray' }}>
                            로딩 중...
                        </Typography>
                    ) : workspaces.length === 0 ? (
                        // ✅ 로딩이 끝났지만 워크스페이스가 없을 때 표시
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setModalOpen(true)}
                            sx={{ height: 36, textTransform: 'none' }}
                        >
                            워크스페이스 생성
                        </Button>
                    ) : (
                        // ✅ 로딩이 끝났고 워크스페이스가 있을 때 표시
                        <>
                            {/* ✅ 현재 선택된 워크스페이스 이름 표시 */}
                            <Typography variant="subtitle1">
                                {workspace ? workspace.wsName : '워크스페이스 선택'}
                            </Typography>

                            {/* ✅ 메뉴 열기 버튼 */}
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={handleClick} // 클릭 시 메뉴 열기
                                sx={{ height: 36, textTransform: 'none' }}
                                disabled={loading} // 로딩 중일 때 비활성화
                            >
                                {loading ? '로딩 중...' : '워크스페이스 변경'}
                            </Button>

                            {/* ✅ 워크스페이스 선택 메뉴 */}
                            {/* <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} sx={{ width: '100%' }}> */}
                            {/* ✅ 워크스페이스 목록 표시 */}
                            {/* {workspaces.map((ws) => (
                                    <MenuItem key={ws.wsId} onClick={() => handleSelect(ws)}>
                                        {ws.wsName}
                                    </MenuItem>
                                ))} */}
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                                {workspaces.map((ws) => (
                                    <MenuItem key={ws.id}>{ws.name}</MenuItem>
                                ))}

                                {/* ✅ 최하단의 파란색 버튼 (워크스페이스 생성) */}
                                <MenuItem>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => setModalOpen(true)}
                                        sx={{
                                            backgroundColor: '#1976d2',
                                            color: '#ffffff',
                                            textTransform: 'none',
                                            mt: 1,
                                            '&:hover': {
                                                backgroundColor: '#1565c0' // 호버 시 더 진한 파란색으로 변경
                                            }
                                        }}
                                    >
                                        워크스페이스 생성
                                    </Button>
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            )}

            {/* ✅ 워크스페이스 생성 모달창 */}
            <CreateWorkspaceModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </Box>
    );
};

export default WorkspaceSelector;
