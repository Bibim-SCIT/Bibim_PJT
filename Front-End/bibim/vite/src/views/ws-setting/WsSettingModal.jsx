import { useState } from 'react';
import { 
    Modal, 
    Box, 
    Typography, 
    TextField, 
    Button,
    Avatar
} from '@mui/material';
import { updateWorkspace } from '../../api/workspace';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,  // 모서리 둥글게
    display: 'flex',
    flexDirection: 'column',
    gap: 2
};

const WsSettingModal = ({ open, handleClose, workspace, onUpdate }) => {
    const [newName, setNewName] = useState(workspace?.wsName || '');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(workspace?.wsImg || '');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageDelete = () => {
        setNewImage(null);
        setImagePreview('');
    };

    const handleSubmit = async () => {
        try {
            await updateWorkspace(
                workspace.wsName,
                newName,
                newImage
            );
            handleClose();
            alert('워크스페이스가 업데이트되었습니다.');
        } catch (error) {
            console.error('워크스페이스 업데이트 실패:', error);
            alert('업데이트에 실패했습니다.');
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography 
                    variant="h4"
                    component="h2" 
                    sx={{ 
                        mb: 3,
                        pb: 2,
                        borderBottom: '1px solid #e0e0e0',
                        fontWeight: 400  // 기본 굵기로 변경 (normal)
                    }}
                >
                    워크스페이스 설정
                </Typography>

                {/* 이미지 업로드 영역 */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    gap: 2
                }}>
                    <input
                        accept="image/*"
                        type="file"
                        id="icon-button-file"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="icon-button-file">
                        <Avatar
                            src={imagePreview}
                            sx={{ 
                                width: 100, 
                                height: 100,
                                border: '1px solid #eee',
                                cursor: 'pointer',  // 클릭 가능함을 표시
                                '&:hover': {
                                    opacity: 0.8  // 호버 효과
                                }
                            }}
                        />
                    </label>
                    
                    {/* 이미지 관리 버튼들 */}
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        justifyContent: 'center'
                    }}>
                        <label htmlFor="icon-button-file">
                            <Button
                                variant="contained"
                                component="span"
                                size="small"
                                sx={{
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#1565c0'
                                    }
                                }}
                            >
                                이미지 설정
                            </Button>
                        </label>
                        {imagePreview && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleImageDelete}
                                sx={{
                                    color: '#666',
                                    borderColor: '#666',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        borderColor: '#666'
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
                    label="워크스페이스 이름"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                />

                {/* 버튼 그룹 */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 1, 
                    mt: 3 
                }}>
                    <Button 
                        onClick={handleClose} 
                        color="inherit"
                        variant="outlined"
                    >
                        취소
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                    >
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default WsSettingModal; 