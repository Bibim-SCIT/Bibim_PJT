import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem } from '@mui/material';

const MOCK_USERS = [
    { name: '김민수', email: 'minsu.kim@example.com', nickname: '민수', role: '오너' },
    { name: '이지영', email: 'jiyoung.lee@example.com', nickname: '지영', role: '유저' },
    { name: '박준호', email: 'junho.park@example.com', nickname: '준호', role: '관리자' },
    { name: '최수진', email: 'sujin.choi@example.com', nickname: '수진', role: '유저' },
    { name: '정다운', email: 'daun.jung@example.com', nickname: '다운', role: '유저' },
];

const WsRoleSetting = () => {
    return (
        <Box sx={{ px: 4, py: 2 }}>
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
                            <TableCell width="20%" sx={{ pl: 2 }}>권한 변경</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {MOCK_USERS.map((user, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ pl: 2 }}>{user.name}</TableCell>
                                <TableCell sx={{ pl: 2 }}>{user.email}</TableCell>
                                <TableCell sx={{ pl: 2 }}>{user.nickname}</TableCell>
                                <TableCell sx={{ pl: 2 }}>
                                    <Select
                                        size="small"
                                        value={user.role}
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#e0e0e0'
                                            }
                                        }}
                                    >
                                        <MenuItem value="오너">오너</MenuItem>
                                        <MenuItem value="관리자">관리자</MenuItem>
                                        <MenuItem value="유저">유저</MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default WsRoleSetting; 