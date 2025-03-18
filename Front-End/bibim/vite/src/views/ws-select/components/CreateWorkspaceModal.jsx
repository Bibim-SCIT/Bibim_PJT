import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    Divider,
    Stack
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createWorkspace } from '../../../api/workspaceApi';
import { loadWorkspace } from '../../../store/workspaceRedux';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import defaultWorkspaceImage from '../../../assets/images/icons/bibimsero.png'; // 기본 로고 이미지

// 모달창 스타일
const modalStyle = {
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

const defaultImage = 'https://bibim2.s3.ap-northeast-2.amazonaws.com/workdata-files/587fb795-8fbf-4a5c-a203-d714f585422d.png';

const CreateWorkspaceModal = ({ open, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceImage, setWorkspaceImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(defaultWorkspaceImage);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 모달이 열릴 때 초기화
    useEffect(() => {
        if (open) {
            setWorkspaceName('');
            setWorkspaceImage(null);
            setPreviewImage(defaultWorkspaceImage);
        }
    }, [open]);

    // 이미지 선택 핸들러
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setWorkspaceImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setWorkspaceImage(null);
        setPreviewImage(null);
    };

    // 워크스페이스 생성 요청
    const handleCreate = async () => {
        if (!workspaceName.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다. 다시 로그인 후 시도해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);

            let fileToSend = workspaceImage;
            if (!fileToSend) {
                // 기본 이미지 URL을 Blob으로 변환하여 파일로 전송
                const response = await fetch(defaultImage);
                const blob = await response.blob();
                fileToSend = new File([blob], "defaultImage.png", { type: "image/png" });
            }

            await createWorkspace(workspaceName, fileToSend);
            // await createWorkspace(workspaceName, workspaceImage || defaultImage);
            await dispatch(loadWorkspace());

            console.log("원래등록", workspaceImage, workspaceName);
            console.log("워크스페이스 생성 요청:", fileToSend, workspaceName);

            // 성공 콜백이 있으면 호출
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess();
            }

            onClose();
        } catch (error) {
            console.error("워크스페이스 생성 실패:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
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
                        워크스페이스 생성
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
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="워크스페이스 이미지"
                                        style={{
                                            width: previewImage === defaultWorkspaceImage ? '70%' : '100%',
                                            height: previewImage === defaultWorkspaceImage ? 'auto' : '100%',
                                            objectFit: previewImage === defaultWorkspaceImage ? 'cover' : 'contain',
                                        }}
                                    />
                                ) : (
                                    <PhotoCameraIcon sx={{ color: '#999', fontSize: 40 }} />
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
                                    onClick={handleRemoveImage}
                                    size="small"
                                    disabled={!previewImage}
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
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                placeholder="워크스페이스 이름을 입력하세요"
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
                        onClick={handleCreate}
                        disabled={isSubmitting || !workspaceName.trim()}
                        sx={{
                            bgcolor: '#4a6cc7',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#3f5ba9',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {isSubmitting ? '생성 중...' : '생성하기'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CreateWorkspaceModal;
