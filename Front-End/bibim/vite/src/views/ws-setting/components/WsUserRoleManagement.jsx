import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Avatar, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { kickUserFromWorkspace, fetchWorkspaceUsers } from '../../../api/workspaceApi'; // API 함수 임포트

const MOCK_USERS = [
    { nickname: '서연', email: 'seoyeon.park@example.com', lastLogin: '2024-03-19 14:30', role: '오너', profileImage: null },
    { nickname: '준호', email: 'junho.choi@example.com', lastLogin: '2024-03-19 11:20', role: '유저', profileImage: null },
    { nickname: '유진', email: 'yujin.kim@example.com', lastLogin: '2024-03-18 17:45', role: '유저', profileImage: null },
    { nickname: '태민', email: 'taemin.lee@example.com', lastLogin: '2024-03-18 09:15', role: '유저', profileImage: null },
    { nickname: '하늘', email: 'haneul.kang@example.com', lastLogin: '2024-03-17 16:30', role: '유저', profileImage: null },
];

// 날짜 포맷팅 함수 수정
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 권한 매핑 함수 추가
const mapRole = (role) => {
    return role.toLowerCase() === 'owner' ? '오너' : '멤버';
};

const WsUserRoleManagement = () => {
    const [openKickDialog, setOpenKickDialog] = useState(false);
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [users, setUsers] = useState([]); // 사용자 목록 상태 추가

    // Redux에서 현재 활성화된 워크스페이스 정보 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const loading = useSelector((state) => state.workspace.loading);

    useEffect(() => {
        const loadUsers = async () => {
            if (activeWorkspace) {
                try {
                    const response = await fetchWorkspaceUsers(activeWorkspace.wsId);
                    const usersData = response.data || []; // response.data에 실제 사용자 배열이 있음
                    setUsers(usersData);
                    console.log('불러온 사용자 데이터:', usersData);
                } catch (error) {
                    console.error('사용자 정보 조회 실패:', error);
                    setUsers([]);
                }
            } else {
                setUsers([]);
            }
        };

        loadUsers();
    }, [activeWorkspace]);

    const handleKickUser = (user) => {
        setSelectedUser(user);
        setOpenKickDialog(true);
    };

    const handleConfirmKick = async () => {
        try {
            if (selectedUser && activeWorkspace) {
                await kickUserFromWorkspace(activeWorkspace.wsId, selectedUser.email);
                console.log('강퇴 성공:', selectedUser, '워크스페이스:', activeWorkspace.wsId);
                // 강퇴 후 사용자 목록 갱신 로직 추가 필요
            }
        } catch (error) {
            console.error('강퇴 실패:', error);
        } finally {
            setOpenKickDialog(false);
            setSelectedUser(null);
        }
    };

    const handleCloseKickDialog = () => {
        setOpenKickDialog(false);
        setSelectedUser(null);
    };

    const handleOpenRoleSettings = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.wsRole.toLowerCase());
        setOpenRoleDialog(true);
    };

    const handleCloseRoleDialog = () => {
        setOpenRoleDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    const handleSaveRole = () => {
        // API 연동 시 실제 권한 변경 로직 구현 필요
        console.log('권한 변경:', selectedUser.nickname, selectedRole, '워크스페이스:', activeWorkspace?.wsId);
        setOpenRoleDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>로딩 중...</Typography>
            </Box>
        );
    }

    if (!activeWorkspace) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>워크스페이스를 선택해주세요.</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ px: 4, pb: 4 }}>
                <TableContainer sx={{ maxHeight: 300 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ 
                                '& th': { 
                                    borderBottom: '1px solid #e0e0e0',
                                    fontWeight: 'normal',
                                    bgcolor: '#f8f9fa'
                                }
                            }}>
                                <TableCell width="20%" sx={{ pl: 2 }}>사용자</TableCell>
                                <TableCell width="20%" sx={{ pl: 2 }}>이메일</TableCell>
                                <TableCell width="20%" sx={{ pl: 2 }}>마지막 로그인</TableCell>
                                <TableCell width="20%" sx={{ pl: 2 }}>권한</TableCell>
                                <TableCell width="20%" sx={{ pl: 2 }}>관리</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ pl: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar 
                                                    src={user.profileImage} 
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32,
                                                        bgcolor: '#e0e0e0'
                                                    }}
                                                >
                                                    {user.nickname[0]}
                                                </Avatar>
                                                <Typography>{user.nickname}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ pl: 2 }}>{user.email}</TableCell>
                                        <TableCell sx={{ pl: 2 }}>{formatDate(user.lastActiveTime)}</TableCell>
                                        <TableCell sx={{ pl: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography>{mapRole(user.wsRole)}</Typography>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleOpenRoleSettings(user)}
                                                    variant="outlined"
                                                    sx={{ 
                                                        color: '#666',
                                                        borderColor: '#e0e0e0',
                                                        '&:hover': { 
                                                            borderColor: '#bdbdbd',
                                                            bgcolor: 'rgba(0, 0, 0, 0.04)' 
                                                        },
                                                        textTransform: 'none',
                                                        minWidth: 'auto',
                                                        px: 1.5,
                                                        py: 0.5,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    변경
                                                </Button>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ pl: 2 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleKickUser(user)}
                                                sx={{
                                                    color: '#e53935',
                                                    borderColor: '#e53935',
                                                    '&:hover': {
                                                        borderColor: '#d32f2f',
                                                        backgroundColor: 'rgba(229, 57, 53, 0.04)'
                                                    },
                                                    textTransform: 'none',
                                                    fontSize: '0.875rem',
                                                    py: 0.5
                                                }}
                                            >
                                                강퇴
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                                        <Typography>사용자가 없습니다.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* 강퇴 확인 다이얼로그 */}
            <Dialog
                open={openKickDialog}
                onClose={handleCloseKickDialog}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    강퇴 확인
                </DialogTitle>
                <DialogContent sx={{ pb: 2 }}>
                    {selectedUser && (
                        <Box>
                            <Typography sx={{ mb: 2, color: '#666' }}>
                                다음 유저를 워크스페이스에서 강퇴하시겠습니까?
                            </Typography>
                            <Box sx={{ 
                                bgcolor: '#f8f9fa',
                                p: 2,
                                borderRadius: 1
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
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
                                    <Typography>
                                        닉네임: {selectedUser.nickname}
                                    </Typography>
                                </Box>
                                <Typography sx={{ mb: 0.5 }}>
                                    이메일: {selectedUser.email}
                                </Typography>
                                <Typography>
                                    마지막 로그인: {formatDate(selectedUser.lastActiveTime)}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCloseKickDialog}
                        sx={{ color: '#666' }}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmKick}
                        sx={{
                            bgcolor: '#e53935',
                            '&:hover': { bgcolor: '#d32f2f' }
                        }}
                    >
                        강퇴하기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 권한 설정 다이얼로그 수정 */}
            <Dialog
                open={openRoleDialog}
                onClose={handleCloseRoleDialog}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    권한 설정
                </DialogTitle>
                <DialogContent sx={{ pb: 2 }}>
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
                                    onChange={handleRoleChange}
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
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCloseRoleDialog}
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
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WsUserRoleManagement; 