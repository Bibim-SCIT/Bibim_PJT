import { Box, Typography } from '@mui/material';
import WsBasicSetting from './components/WsBasicSetting';
import WsRoleSetting from './components/WsRoleSetting';
import WsUserManagement from './components/WsUserManagement';

const WsSettingPage = () => {
    return (
        <Box sx={{ 
            maxWidth: '100%',
            p: { xs: 1.5, sm: 2 }
        }}>
            {/* 1. 워크스페이스 기본 정보 컴포넌트 */}
            <Box sx={{ 
                mb: 2,
                bgcolor: 'white',
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}>
                <WsBasicSetting />
            </Box>

            {/* 2. 권한 관리 컴포넌트 */}
            <Box sx={{ 
                mb: 2,
                bgcolor: 'white',
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}>
                <Box sx={{ 
                    px: 3,
                    py: 2.5,
                }}>
                    <Typography sx={{ 
                        fontSize: '18px',
                        fontWeight: 500
                    }}>
                        권한 관리
                    </Typography>
                </Box>
                <WsRoleSetting />
                <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'flex-end'
                }}>
                    <button 
                        style={{
                            padding: '6px 16px',
                            backgroundColor: '#4a6cc7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        권한 변경 저장
                    </button>
                </Box>
            </Box>

            {/* 3. 사용자 관리 컴포넌트 */}
            <Box sx={{ 
                bgcolor: 'white',
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}>
                <Box sx={{ 
                    px: 3,
                    py: 2.5,
                }}>
                    <Typography sx={{ 
                        fontSize: '18px',
                        fontWeight: 500
                    }}>
                        사용자 관리
                    </Typography>
                </Box>
                <WsUserManagement />
            </Box>
        </Box>
    );
};

export default WsSettingPage;
