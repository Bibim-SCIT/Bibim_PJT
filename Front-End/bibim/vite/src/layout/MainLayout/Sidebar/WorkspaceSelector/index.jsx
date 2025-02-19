import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Avatar, Tooltip, Button, Menu, MenuItem } from '@mui/material';
import useConfig from 'hooks/useConfig';

/**
 * 여기서 서버에서 워크스페이스 데이터를 가져와야함
 * 1. 현재 로그인 한 사용자의 이메일 기반으로 wsmember 테이블 검색
 * 2. 해당 되는 ws의 id 전부 전부 가져오기(리스트)
 * 3. ws 테이블에서 가져온 id로 전부 검색 후 결과 값 (리스트)
 * 4. 여기에 보내기
 */

const WorkspaceSelector = () => {
    const { miniDrawer } = useConfig(); // 사이드바 확장 여부 가져오기

    // 현재 선택된 워크스페이스 상태
    const [workspace, setWorkspace] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(false);

    // 메뉴 열기 상태 관리
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // ✅ 서버에서 워크스페이스 목록 가져오기
    useEffect(() => {
        const fetchWorkspaces = async () => {
            setLoading(true);
            try {
                const token = 'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzM5ODY1NzY5LCJleHAiOjE3Mzk4NzI5Njl9.ugMoTU0NmuwwfEZFG9MH3lo6ZUV1vx5m9r8TliqE_M0';
                // localStorage.getItem('token'); // JWT 토큰 가져오기

                if (!token) {
                    console.error('토큰 없음! 로그인 필요');
                    return;
                }

                const response = await axios.get('http://localhost:8080/workspace', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data);
                setWorkspaces(response.data);
                setWorkspace(response.data[0]); // 첫 번째 워크스페이스를 기본 선택
            } catch (error) {
                console.error('워크스페이스 불러오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, []);

    // 버튼 클릭 시 메뉴 열기
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // 워크스페이스 변경 핸들러
    const handleSelect = (selectedWorkspace) => {
        setWorkspace(selectedWorkspace);
        setAnchorEl(null); // 메뉴 닫기
    };

    if (loading) return <p>로딩 중...</p>;
    if (!workspace) return <p>워크스페이스를 찾을 수 없습니다.</p>;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                flexDirection: miniDrawer ? 'column' : 'row',
                justifyContent: miniDrawer ? 'center' : 'space-between'
            }}
        >
            {/* ✅ 현재 워크스페이스 이미지 표시 */}
            <Tooltip title={workspace.wsName} placement="right">
                <Avatar
                    src={workspace.wsImg}
                    alt={workspace.wsName}
                    sx={{ width: 40, height: 40, cursor: 'pointer', mb: miniDrawer ? 1 : 0 }}
                />
            </Tooltip>

            {/* ✅ 사이드바가 열렸을 때만 버튼 보이기 */}
            {!miniDrawer && (
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                    <Typography variant="subtitle1">{workspace.wsName}</Typography>

                    {/* ✅ 버튼 클릭 시 메뉴를 띄워 워크스페이스 선택 가능 */}
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClick}
                        sx={{ height: 36, textTransform: 'none' }}
                    >
                        워크스페이스 변경
                    </Button>

                    {/* 워크스페이스 선택 메뉴 */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                        sx={{ width: '100%' }}
                    >
                        {workspaces.map((ws) => (
                            <MenuItem key={ws.wsId} onClick={() => handleSelect(ws)}>
                                {ws.wsName} 
                                {/* 여기서 사이트가 이동을 해야하는데... */}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            )}
        </Box>
    );
};

export default WorkspaceSelector;
