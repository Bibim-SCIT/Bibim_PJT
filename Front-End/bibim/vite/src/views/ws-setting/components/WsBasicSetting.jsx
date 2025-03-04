import { Box, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import WsSettingModal from './WsSettingModal';
import { getWorkspaces } from '../../../api/workspaceApi';

const WsBasicSetting = () => {
    const [openModal, setOpenModal] = useState(false);
    const [workspaceInfo, setWorkspaceInfo] = useState(null);
    
    // Redux에서 현재 활성화된 워크스페이스 정보 가져오기
    const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
    const loading = useSelector((state) => state.workspace.loading);

    // 활성화된 워크스페이스 정보 설정
    useEffect(() => {
        if (activeWorkspace) {
            setWorkspaceInfo(activeWorkspace);
        }
    }, [activeWorkspace]);

    // 모달 열기 핸들러
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // 워크스페이스 업데이트 후 정보 갱신
    const handleUpdate = async (updatedInfo) => {
        setOpenModal(false);

        // 워크스페이스 정보를 다시 불러오기
        try {
            const updatedWorkspaces = await getWorkspaces();
            const updatedWorkspace = updatedWorkspaces.find(ws => ws.wsName === updatedInfo.wsName);
            setWorkspaceInfo(updatedWorkspace);
        } catch (error) {
            console.error('워크스페이스 정보를 불러오는데 실패했습니다:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>로딩 중...</Typography>
            </Box>
        );
    }

    if (!workspaceInfo) {
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
                        {workspaceInfo.wsImg ? (
                            <img 
                                src={workspaceInfo.wsImg} 
                                alt={workspaceInfo.wsName}
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
                            {workspaceInfo.wsName}
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
                initialData={workspaceInfo}
            />
        </Box>
    );
};

export default WsBasicSetting; 