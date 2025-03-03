import { Box, Typography, Avatar, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useState } from 'react';
import WsSettingModal from './WsSettingModal';

const WsBasicSetting = () => {
    const [openModal, setOpenModal] = useState(false);
    const [wsInfo, setWsInfo] = useState({
        name: '디자인팀 워크스페이스',
        image: null
    });

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleUpdate = (updatedInfo) => {
        setWsInfo(updatedInfo);
        // 여기에 필요한 경우 API 호출 추가
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <CameraAltIcon sx={{ color: '#999', fontSize: 32 }} />
                    </Box>
                    <Typography sx={{ 
                        fontSize: '16px',
                        color: '#333'
                    }}>
                        {wsInfo.name}
                    </Typography>
                </Box>

                <IconButton 
                    onClick={handleOpenModal}
                    sx={{ 
                        color: '#666',
                        '&:hover': { 
                            bgcolor: 'rgba(0, 0, 0, 0.04)' 
                        }
                    }}
                >
                    <SettingsIcon />
                </IconButton>
            </Box>

            <WsSettingModal 
                open={openModal}
                handleClose={handleCloseModal}
                workspace={wsInfo}
                onUpdate={handleUpdate}
            />
        </Box>
    );
};

export default WsBasicSetting; 