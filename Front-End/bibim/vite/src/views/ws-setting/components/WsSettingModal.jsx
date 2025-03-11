import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Box, 
    Stack, 
    Snackbar, 
    Alert,
    Modal,
    Typography,
    IconButton,
    Divider
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import { updateWorkspace } from '../../../api/workspaceApi';

// 모달 스타일 정의
const style = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 24,
    p: 0,
    position: 'relative',
    outline: 'none'
};

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
            <Modal open={open} onClose={onClose}>
                <Box sx={style}>
                    {/* 헤더 영역 */}
                    <Box sx={{ p: 3, pb: 2 }}>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 400,
                                mb: 0
                            }}
                        >
                            워크스페이스 설정
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: '#e0e0e0' }} />

                    {/* 내용 영역 */}
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 3
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
                                        mb: 2,
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
                                    gap: 1.5,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%'
                                }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleImageDelete}
                                        size="small"
                                        sx={{ 
                                            color: '#666',
                                            borderColor: '#d0d0d0',
                                            boxShadow: 'none'
                                        }}
                                    >
                                        이미지 삭제
                                    </Button>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        size="small"
                                        sx={{ 
                                            bgcolor: '#4a6cc7',
                                            boxShadow: 'none',
                                            '&:hover': { 
                                                bgcolor: '#3f5ba9',
                                                boxShadow: 'none'
                                            }
                                        }}
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

                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'left' }}>
                                    워크스페이스 이름
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* 하단 버튼 영역 */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        p: 2,
                        bgcolor: '#f8f9fa',
                        borderTop: '1px solid #e0e0e0'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            disabled={isSubmitting}
                            sx={{
                                color: '#666',
                                borderColor: '#d0d0d0',
                                boxShadow: 'none'
                            }}
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            sx={{
                                bgcolor: '#4a6cc7',
                                boxShadow: 'none',
                                '&:hover': { 
                                    bgcolor: '#3f5ba9',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            {isSubmitting ? '저장 중...' : '저장'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
            
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