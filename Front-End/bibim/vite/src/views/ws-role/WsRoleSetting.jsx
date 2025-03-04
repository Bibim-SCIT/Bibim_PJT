import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Divider, Paper } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const WsRoleSetting = ({ workspace }) => {
    return (
        <MainCard>
            {/* 1. 워크스페이스 관리 권한 */}
            <Typography variant="h3" sx={{ mb: 2 }}>
                워크스페이스 관리 권한
            </Typography>
            <Divider sx={{ mb: 4, borderColor: '#e0e0e0' }} />

            {/* 중앙 정렬을 위한 컨테이너 */}
            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '800px',
                margin: '0 auto',
            }}>
                {/* 2. 워크스페이스 정보 */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 3,
                    width: '100%',
                    mb: 4,
                    pl: 2
                }}>
                    <Avatar
                        src={workspace?.wsImg}
                        sx={{ width: 60, height: 60 }}
                    />
                    <Typography variant="h4" sx={{ fontWeight: 400 }}>
                        {workspace?.wsName || '디자인 팀 워크스페이스'}
                    </Typography>
                </Box>

                {/* 3. 현재 오너 섹션 */}
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h5" sx={{ mb: 3 }}>
                        현재 오너
                    </Typography>

                    <List sx={{ mb: 3, width: '100%' }}>
                        {[
                            { id: 1, name: '김지원', profileImg: '' },
                            { id: 2, name: '이서연', profileImg: '' }
                        ].map((user) => (
                            <Paper
                                key={user.id}
                                elevation={0}
                                sx={{ 
                                    mb: 2,
                                    bgcolor: '#f8f9fa',
                                    borderRadius: 1
                                }}
                            >
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={user.profileImg} />
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={user.name}
                                    />
                                    <Button 
                                        variant="outlined" 
                                        color="error"
                                        size="small"
                                    >
                                        권한 삭제
                                    </Button>
                                </ListItem>
                            </Paper>
                        ))}
                    </List>

                    {/* 오너 추가 버튼 */}
                    <Button
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        sx={{ 
                            color: '#666',
                            borderColor: '#666',
                            '&:hover': {
                                borderColor: '#666',
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        오너 추가
                    </Button>
                </Box>
            </Box>
        </MainCard>
    );
};

export default WsRoleSetting;
