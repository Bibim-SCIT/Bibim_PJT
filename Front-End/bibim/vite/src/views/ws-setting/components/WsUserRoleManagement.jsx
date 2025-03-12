import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Avatar, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { kickUserFromWorkspace, fetchWorkspaceUsers, updateUserRole } from '../../../api/workspaceApi'; // API 함수 임포트
import KickUserModal from './KickUserModal';
import RoleSettingModal from './RoleSettingModal';
import { useContext } from 'react';
import { ConfigContext } from '../../../contexts/ConfigContext';
import WSMLoadingScreen from './WSMLoadingScreen';

// 상대적인 시간 또는 날짜를 표시하는 함수
const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = now - date;
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    // 1시간 이내는 모두 '방금 전'으로 표시
    if (diffHours < 1) {
        return '방금 전';
    }

    // 오늘 안에 (24시간 이내)
    if (diffHours < 24) {
        return `${diffHours}시간 전`;
    }

    // 7일 이내
    if (diffDays < 7) {
        if (diffDays === 1) return '어제';
        return `${diffDays}일 전`;
    }

    // 4주 이내
    if (diffWeeks < 4) {
        return `${diffWeeks}주 전`;
    }

    // 한달 이상이면 YYYY-MM-DD 형식
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 권한 이름을 한글로 변환하는 함수 (예: 'owner' -> '오너')
const mapRole = (role) => {
    if (!role) return '멤버';  // role이 없는 경우 기본값
    return role.toLowerCase() === 'owner' ? '오너' : '멤버';
};

const WsUserRoleManagement = () => {
    // ✅ Context에서 로그인 유저 정보 가져오기
    const { user } = useContext(ConfigContext);
    const currentUser = user.email;
    console.log("현재 유저 이메일:", currentUser);

    // 사용자 강퇴 모달 표시 여부 상태
    const [openKickModal, setOpenKickModal] = useState(false);

    // 권한 설정 모달 표시 여부 상태
    const [openRoleModal, setOpenRoleModal] = useState(false);

    // 현재 선택된 사용자 정보 상태
    const [selectedUser, setSelectedUser] = useState(null);

    // 선택된 권한 값 상태
    const [selectedRole, setSelectedRole] = useState('');

    // 워크스페이스 사용자 목록 상태
    const [users, setUsers] = useState([]);

    // 로컬 로딩 상태 추가
    const [isLoading, setIsLoading] = useState(false);

    // 알림 메시지 표시를 위한 스낵바 상태
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
                setIsLoading(true);
                try {
                    const response = await fetchWorkspaceUsers(activeWorkspace.wsId);
                    console.log("워크스페이스 사용자 응답:", response);

                    if (response && response.data) {
                        setUsers(response.data);
                        console.log("받기성공 - response.data:", response.data);
                    } else if (response) {
                        // response 자체가 데이터인 경우
                        setUsers(response);
                        console.log("받기성공 - response:", response);
                    } else {
                        setUsers([]);
                        setSnackbar({
                            open: true,
                            message: '사용자 정보를 불러오는데 실패했습니다.',
                            severity: 'error'
                        });
                    }
                } catch (error) {
                    console.error('사용자 정보 조회 실패:', error);
                    setUsers([]);
                    setSnackbar({
                        open: true,
                        message: '사용자 정보를 불러오는데 실패했습니다.',
                        severity: 'error'
                    });
                } finally {
                    setIsLoading(false);
                }
            } else {
                setUsers([]);
            }
        };

        loadUsers();
    }, [activeWorkspace]);

    // 사용자 강퇴 처리 함수
    const handleKickUser = (usermemeber) => {
        setSelectedUser(usermemeber);
        setOpenKickModal(true);
    };

    // 강퇴 확인 처리 함수
    const handleConfirmKick = async () => {
        try {
            if (selectedUser && activeWorkspace) {
                await kickUserFromWorkspace(activeWorkspace.wsId, selectedUser.email);

                // 강퇴 성공 후 즉시 목록 갱신
                const response = await fetchWorkspaceUsers(activeWorkspace.wsId);
                if (response && response.data) {
                    setUsers(response.data);
                    console.log("강퇴 후 불러온 사용자 목록:", response.data);
                } else {
                    // response 자체가 데이터인 경우
                    setUsers(response || []);
                    console.log("강퇴 후 불러온 사용자 목록:", response);
                }

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

    // 강퇴 모달 닫기 함수
    const handleCloseKickModal = () => {
        setOpenKickModal(false);
        setSelectedUser(null);
    };

    // 권한 설정 모달 열기 함수
    const handleOpenRoleSettings = (usermember) => {
        setSelectedUser(usermember);
        setSelectedRole(usermember.wsRole.toLowerCase());
        setOpenRoleModal(true);
    };

    // 권한 설정 모달 닫기 함수
    const handleCloseRoleModal = () => {
        setOpenRoleModal(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    // 권한 변경 처리 함수
    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    // 권한 저장 처리 함수
    const handleSaveRole = async () => {
        try {
            await updateUserRole(activeWorkspace.wsId, selectedUser.email, selectedRole);

            // 변경 성공 후 즉시 목록 갱신
            const response = await fetchWorkspaceUsers(activeWorkspace.wsId);
            if (response && response.data) {
                setUsers(response.data);
                console.log("권한 변경 후 불러온 사용자 목록:", response.data);
            } else {
                // response 자체가 데이터인 경우
                setUsers(response || []);
                console.log("권한 변경 후 불러온 사용자 목록:", response);
            }

            setOpenRoleModal(false);
            setSelectedUser(null);
            setSelectedRole('');

            setSnackbar({
                open: true,
                message: '권한이 성공적으로 변경되었습니다.',
                severity: 'success'
            });
        } catch (error) {
            console.error('권한 변경 실패:', error);
            setSnackbar({
                open: true,
                message: '권한 변경에 실패했습니다.',
                severity: 'error'
            });
        }
    };

    // 스낵바 닫기 함수
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // users 상태가 변경될 때마다 확인
    useEffect(() => {
        console.log('현재 users 상태:', users);
    }, [users, activeWorkspace]);

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <WSMLoadingScreen />
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
                                users.map((usermember, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ pl: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar
                                                    src={usermember.profileImage}
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        bgcolor: '#e0e0e0'
                                                    }}
                                                >
                                                    {usermember.nickname ? usermember.nickname.charAt(0) : '?'}
                                                </Avatar>
                                                <Typography>{usermember.nickname || '알 수 없음'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ pl: 2 }}>{usermember.email}</TableCell>
                                        <TableCell sx={{ pl: 2 }}>{formatDate(usermember.lastActiveTime)}</TableCell>
                                        <TableCell sx={{ pl: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography>{mapRole(usermember?.wsRole)}</Typography>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleOpenRoleSettings(usermember)}
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
                                                onClick={() => handleKickUser(usermember)}
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
                                                disabled={usermember.email == currentUser}
                                            >
                                                강퇴
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                                        {isLoading ? (
                                            <WSMLoadingScreen />
                                        ) : (
                                            <Typography>사용자가 없습니다.</Typography>
                                        )}
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
