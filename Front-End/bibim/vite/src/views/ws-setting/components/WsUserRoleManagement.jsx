import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Avatar, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { kickUserFromWorkspace, fetchWorkspaceUsers } from '../../../api/workspaceApi'; // API 함수 임포트
import KickUserModal from './KickUserModal';
import RoleSettingModal from './RoleSettingModal';

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
    const [openKickModal, setOpenKickModal] = useState(false);
    const [openRoleModal, setOpenRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [users, setUsers] = useState([]); // 사용자 목록 상태 추가
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Redux에서 현재 활성화된 워크스페이스 정보 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const loading = useSelector((state) => state.workspace.loading);

    useEffect(() => {
        const loadUsers = async () => {
            if (activeWorkspace) {
                try {
                    const response = await fetchWorkspaceUsers(activeWorkspace.wsId);
                    const usersData = response.data || [];
                    console.log('초기 로딩된 사용자 목록:', usersData);
                    setUsers(usersData);
                } catch (error) {
                    console.error('사용자 정보 조회 실패:', error);
                    setUsers([]);
                }
            } else {
                setUsers([]);
            }
        };

        loadUsers();
    }, [activeWorkspace, fetchWorkspaceUsers]);

    const handleKickUser = (user) => {
        setSelectedUser(user);
        setOpenKickModal(true);
    };

    const handleConfirmKick = async () => {
        try {
            if (selectedUser && activeWorkspace) {
                console.log('강퇴 시도:', { 
                    wsId: activeWorkspace.wsId, 
                    email: selectedUser.email 
                });
                
                await kickUserFromWorkspace(activeWorkspace.wsId, selectedUser.email);
                console.log('강퇴 API 호출 성공');
                
                // 강퇴 성공 후 즉시 목록 갱신
                const response = await fetchWorkspaceUsers(activeWorkspace.wsId);
                console.log('사용자 목록 갱신 응답:', response);
                
                const updatedUsers = response.data || [];
                setUsers(updatedUsers);
                
                setOpenKickModal(false);
                setSelectedUser(null);

                setSnackbar({
                    open: true,
                    message: `${selectedUser.nickname}님을 워크스페이스에서 강퇴했습니다.`,
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('강퇴 처리 중 에러:', error);
            setSnackbar({
                open: true,
                message: '강퇴에 실패했습니다.',
                severity: 'error'
            });
        }
    };

    const handleCloseKickModal = () => {
        setOpenKickModal(false);
        setSelectedUser(null);
    };

    const handleOpenRoleSettings = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.wsRole.toLowerCase());
        setOpenRoleModal(true);
    };

    const handleCloseRoleModal = () => {
        setOpenRoleModal(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    const handleSaveRole = () => {
        // API 연동 시 실제 권한 변경 로직 구현 필요
        console.log('권한 변경:', selectedUser.nickname, selectedRole, '워크스페이스:', activeWorkspace?.wsId);
        setOpenRoleModal(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // users 상태가 변경될 때마다 확인
    useEffect(() => {
        console.log('현재 users 상태:', users);
    }, [users]);

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

            <KickUserModal 
                open={openKickModal}
                onClose={handleCloseKickModal}
                selectedUser={selectedUser}
                onConfirm={handleConfirmKick}
                formatDate={formatDate}
                workspaceId={activeWorkspace?.wsId}
            />

            <RoleSettingModal 
                open={openRoleModal}
                onClose={handleCloseRoleModal}
                selectedUser={selectedUser}
                selectedRole={selectedRole}
                onRoleChange={handleRoleChange}
                onSave={handleSaveRole}
                workspaceId={activeWorkspace?.wsId}
            />

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
        </>
    );
};

export default WsUserRoleManagement; 