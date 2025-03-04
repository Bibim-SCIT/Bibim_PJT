import { Box, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import WsSettingModal from './WsSettingModal';

const WsBasicSetting = () => {
    const [openModal, setOpenModal] = useState(false);
    
    // Redux에서 현재 활성화된 워크스페이스 정보 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const loading = useSelector((state) => state.workspace.loading);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleUpdate = (updatedInfo) => {
        // API 연동 시 실제 업데이트 로직 구현 필요
        console.log('워크스페이스 정보 업데이트:', updatedInfo);
        setOpenModal(false);
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
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {activeWorkspace?.wsImg ? (
                            <img 
                                src={activeWorkspace.wsImg} 
                                alt={activeWorkspace.wsName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <CameraAltIcon sx={{ color: '#999', fontSize: 32 }} />
                        )}
                    </Box>
                    <Box>
                        <Typography sx={{ 
                            fontSize: '13px',
                            color: '#666',
                            mb: 0.5
                        }}>
                            워크스페이스 이름
                        </Typography>
                        <Typography sx={{ 
                            fontSize: '16px',
                            color: '#333'
                        }}>
                            {activeWorkspace?.wsName}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleOpenModal}>
                    <SettingsIcon />
                </IconButton>
            </Box>

            <WsSettingModal
                open={openModal}
                onClose={handleCloseModal}
                onUpdate={handleUpdate}
                initialData={activeWorkspace}
            />
        </Box>
    );
};

export default WsBasicSetting; 