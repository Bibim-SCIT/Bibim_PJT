import { useState } from 'react';
import { Box, Typography, Avatar, Tooltip, Button, Menu, MenuItem } from '@mui/material';
import useConfig from 'hooks/useConfig';

const WorkspaceSelector = () => {
    const { miniDrawer } = useConfig(); // 사이드바 확장 여부 가져오기

    // 현재 선택된 워크스페이스 상태
    const [workspace, setWorkspace] = useState({
        id: 'workspace1',
        name: '개발팀 워크스페이스',
        image: 'https://via.placeholder.com/40' // 워크스페이스 대표 이미지
    });

    // 워크스페이스 목록
    const workspaces = [
        { id: 'workspace1', name: '개발팀 워크스페이스', image: 'https://via.placeholder.com/40' },
        { id: 'workspace2', name: '디자인팀 워크스페이스', image: 'https://via.placeholder.com/40' },
        { id: 'workspace3', name: '마케팅팀 워크스페이스', image: 'https://via.placeholder.com/40' }
    ];

    // 메뉴 열기 상태 관리
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // 버튼 클릭 시 메뉴 열기
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // 워크스페이스 변경 핸들러
    const handleSelect = (selectedWorkspace) => {
        setWorkspace(selectedWorkspace);
        setAnchorEl(null); // 메뉴 닫기
    };

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
            <Tooltip title={workspace.name} placement="right">
                <Avatar
                    src={workspace.image}
                    alt={workspace.name}
                    sx={{ width: 40, height: 40, cursor: 'pointer', mb: miniDrawer ? 1 : 0 }}
                />
            </Tooltip>

            {/* ✅ 사이드바가 열렸을 때만 버튼 보이기 */}
            {!miniDrawer && (
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                    <Typography variant="subtitle1">{workspace.name}</Typography>

                    {/* ✅ 버튼 클릭 시 메뉴를 띄워 워크스페이스 선택 가능 */}
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClick}
                        sx={{ height: 36, textTransform: 'none' }} // 버튼 크기 줄이고 텍스트 변경 없음
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
                            <MenuItem key={ws.id} onClick={() => handleSelect(ws)}>
                                {ws.name}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            )}
        </Box>
    );
};

export default WorkspaceSelector;
