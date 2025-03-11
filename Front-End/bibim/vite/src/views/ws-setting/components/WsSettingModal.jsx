import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Stack, Snackbar, Alert } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { updateWorkspace } from '../../../api/workspaceApi';

const WsSettingModal = ({ open, onClose, onUpdate, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        image: null
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 초기 데이터 설정
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.wsName || '',
                image: initialData.wsImg || null
            });
        }
    }, [initialData]);

    // 워크스페이스 이름 변경 핸들러
    const handleNameChange = (e) => {
        setFormData(prev => ({
            ...prev,
            name: e.target.value
        }));
    };

    // 이미지 변경 핸들러
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

    // 이미지 삭제 핸들러
    const handleImageDelete = () => {
        setImageFile(null);
        setFormData(prev => ({
            ...prev,
            image: null
        }));
    };

    // 스낵바 닫기 핸들러 추가
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    // 워크스페이스 업데이트 핸들러
    const handleSubmit = async () => {
        if (!initialData?.wsName || !formData.name) return;
        
        try {
            setIsSubmitting(true);
            const response = await updateWorkspace(
                initialData.wsName,
                formData.name,
                imageFile
            );
            
            // 성공 알림 표시
            setSnackbar({
                open: true,
                message: '워크스페이스 정보가 성공적으로 업데이트되었습니다.',
                severity: 'success'
            });
            
            // 응답 처리 방식 수정
            // 업데이트 성공 시 부모 컴포넌트에 변경된 정보 전달
            onUpdate({
                wsName: formData.name,
                wsImg: formData.image
            });
            
            // 약간의 지연 후 모달 닫기 (알림이 보이도록)
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('워크스페이스 업데이트 실패:', error);
            // 실패 알림 표시
            setSnackbar({
                open: true,
                message: `워크스페이스 업데이트 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`,
                severity: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
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
            
            {/* 알림 스낵바 추가 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default WsSettingModal; 