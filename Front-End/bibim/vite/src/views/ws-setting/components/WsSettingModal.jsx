import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Stack } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { updateWorkspace } from '../../../api/workspaceApi';
import { useDispatch } from 'react-redux';
import { loadWorkspace } from 'store/workspaceRedux';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const WsSettingModal = ({ open, onClose, onUpdate, initialData }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        image: null
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.wsName || '',
                image: initialData.wsImg || null
            });
        }
    }, [initialData]);

    const handleNameChange = (e) => {
        setFormData(prev => ({
            ...prev,
            name: e.target.value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData(prev => ({
                ...prev,
                image: URL.createObjectURL(file)
            }));
        }
    };

    const handleImageDelete = () => {
        setImageFile(null);
        setFormData(prev => ({
            ...prev,
            image: null
        }));
    };

    const handleSubmit = async () => {
        if (!initialData?.wsName || !formData.name) return;
        
        try {
            setIsSubmitting(true);
            const response = await updateWorkspace(
                initialData.wsName,
                formData.name,
                imageFile
            );
            
            if (response.data.success) {
                // 업데이트 성공 시 부모 컴포넌트에 변경된 정보 전달
                onUpdate({
                    wsName: formData.name,
                    wsImg: formData.image
                });
                onClose();
            } else {
                console.error('업데이트 실패:', response.data.message);
            }
        } catch (error) {
            console.error('워크스페이스 업데이트 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>워크스페이스 설정</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid #e0e0e0',
                                mb: 1,
                                cursor: 'pointer'
                            }}
                            onClick={() => document.getElementById('workspace-image-input').click()}
                        >
                            {formData.image ? (
                                <img 
                                    src={formData.image} 
                                    alt="워크스페이스 이미지"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <CameraAltIcon sx={{ color: '#999', fontSize: 40 }} />
                            )}
                        </Box>
                        <Stack sx={{ 
                            flexDirection: 'row',
                            gap: 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%'
                        }}>
                            <Button
                                variant="text"
                                onClick={handleImageDelete}
                                size="small"
                            >
                                이미지 삭제
                            </Button>
                            <Button
                                variant="contained"
                                component="label"
                                size="small"
                            >
                                이미지 설정
                                <input
                                    type="file"
                                    id="workspace-image-input"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Stack>
                    </Box>

                    <TextField
                        fullWidth
                        label="워크스페이스 이름"
                        value={formData.name}
                        onChange={handleNameChange}
                        sx={{ mb: 2 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={onClose}
                    disabled={isSubmitting}
                    sx={{ color: '#666' }}
                >
                    취소
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                        bgcolor: '#4a6cc7',
                        '&:hover': { bgcolor: '#3f5ba9' }
                    }}
                >
                    {isSubmitting ? '저장 중...' : '저장'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WsSettingModal; 