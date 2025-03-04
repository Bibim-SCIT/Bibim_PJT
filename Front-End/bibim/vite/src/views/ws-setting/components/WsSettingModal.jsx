import { useState, useEffect } from 'react';
import { 
    Modal, 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Avatar,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 24,
};

const WsSettingModal = ({ open, handleClose, workspace, onUpdate }) => {
    const [wsName, setWsName] = useState(workspace.name);
    const [wsImage, setWsImage] = useState(workspace.image);
    const [previewImage, setPreviewImage] = useState(workspace.image);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setWsImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleImageDelete = () => {
        setWsImage(null);
        setPreviewImage(null);
    };

    const handleSubmit = () => {
        onUpdate({ 
            name: wsName, 
            image: wsImage 
        });
        handleClose();
    };

    useEffect(() => {
        setWsName(workspace.name);
        setWsImage(workspace.image);
        setPreviewImage(workspace.image);
    }, [workspace, open]);

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Box sx={{ p: 3, pb: 2 }}>
                    <IconButton 
                        onClick={handleClose}
                        sx={{ 
                            position: 'absolute',
                            right: 8,
                            top: 8
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6">워크스페이스 설정</Typography>
                </Box>

                <Box sx={{ px: 3, pb: 3 }}>
                    {/* 이미지 업로드 영역 */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        mb: 3
                    }}>
                        <input
                            type="file"
                            hidden
                            id="ws-image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                borderRadius: 1,
                                bgcolor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2  // 이미지와 버튼 사이 간격 증가
                            }}
                        >
                            {previewImage ? (
                                <img 
                                    src={previewImage} 
                                    alt="워크스페이스 이미지"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '4px'
                                    }}
                                />
                            ) : (
                                <CameraAltIcon sx={{ fontSize: 40, color: '#999' }} />
                            )}
                        </Box>
                        
                        {/* 버튼 그룹 */}
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 1
                        }}>
                            <Button
                                variant="outlined"
                                size="small"
                                component="label"
                                htmlFor="ws-image-upload"
                                sx={{ 
                                    color: '#666', 
                                    borderColor: '#ccc',
                                    '&:hover': {
                                        borderColor: '#999'
                                    }
                                }}
                            >
                                이미지 {previewImage ? '변경' : '업로드'}
                            </Button>
                            
                            {previewImage && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleImageDelete}
                                    sx={{ 
                                        color: '#e53935',
                                        borderColor: '#e53935',
                                        '&:hover': {
                                            borderColor: '#d32f2f',
                                            backgroundColor: 'rgba(229, 57, 53, 0.04)'
                                        }
                                    }}
                                >
                                    이미지 삭제
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* 워크스페이스 이름 입력 */}
                    <TextField
                        fullWidth
                        label="워크스페이스 이름"
                        value={wsName}
                        onChange={(e) => setWsName(e.target.value)}
                        size="small"
                    />
                </Box>

                {/* 하단 버튼 영역 */}
                <Box sx={{ 
                    p: 2, 
                    bgcolor: '#f8f9fa', 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: 1,
                    borderTop: '1px solid #eee'
                }}>
                    <Button onClick={handleClose}>
                        취소
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ 
                            bgcolor: '#4a6cc7',
                            '&:hover': { bgcolor: '#3f5ba9' }
                        }}
                    >
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default WsSettingModal; 