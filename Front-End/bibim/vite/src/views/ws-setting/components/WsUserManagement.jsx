import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

const MOCK_USERS = [
    { name: '박서연', email: 'seoyeon.park@example.com', nickname: '서연' },
    { name: '최준호', email: 'junho.choi@example.com', nickname: '준호' },
    { name: '김유진', email: 'yujin.kim@example.com', nickname: '유진' },
    { name: '이태민', email: 'taemin.lee@example.com', nickname: '태민' },
    { name: '강하늘', email: 'haneul.kang@example.com', nickname: '하늘' },
];

const WsUserManagement = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleKickUser = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleConfirmKick = () => {
        // 여기에 실제 강퇴 로직 추가
        console.log('강퇴:', selectedUser);
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

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
                                <TableCell width="20%" sx={{ pl: 2 }}>이름</TableCell>
                                <TableCell width="40%" sx={{ pl: 2 }}>이메일</TableCell>
                                <TableCell width="20%" sx={{ pl: 2 }}>닉네임</TableCell>
                                <TableCell width="20%" sx={{ pl: 2 }}>관리</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {MOCK_USERS.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ pl: 2 }}>{user.name}</TableCell>
                                    <TableCell sx={{ pl: 2 }}>{user.email}</TableCell>
                                    <TableCell sx={{ pl: 2 }}>{user.nickname}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* 강퇴 확인 다이얼로그 */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
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
                                <Typography sx={{ mb: 0.5 }}>
                                    이름: {selectedUser.name}
                                </Typography>
                                <Typography sx={{ mb: 0.5 }}>
                                    이메일: {selectedUser.email}
                                </Typography>
                                <Typography>
                                    닉네임: {selectedUser.nickname}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCloseDialog}
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
        </>
    );
};

export default WsUserManagement; 