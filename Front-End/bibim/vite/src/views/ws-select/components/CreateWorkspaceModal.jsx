import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Avatar, IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';
import { createWorkspace } from '../../../api/workspaceApi';
import { loadWorkspace } from '../../../store/workSpaceRedux';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

// ✅ 모달창 스타일
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
};

const CreateWorkspaceModal = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceImage, setWorkspaceImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // 🔥 이미지 미리보기 URL

    // ✅ 이미지 선택 핸들러
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setWorkspaceImage(file);
            setPreviewImage(URL.createObjectURL(file)); // 🔥 미리보기 URL 생성
        }
    };

    // ✅ 이미지 제거 핸들러
    const handleRemoveImage = () => {
        setWorkspaceImage(null);
        setPreviewImage(null);
    };

    // ✅ 워크스페이스 생성 요청
    // const handleCreate = async () => {
    //     try {
    //         await createWorkspace(workspaceName, workspaceImage);
    //         dispatch(loadWorkspace()); // 워크스페이스 목록 새로 불러오기
    //         onClose(); // 모달 닫기
    //     } catch (error) {
    //         console.error('워크스페이스 생성 실패:', error);
    //     }
    // };
    const handleCreate = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다. 다시 로그인 후 시도해주세요.");
            return;
        }

        try {
            await createWorkspace(workspaceName, workspaceImage);
            await dispatch(loadWorkspace()); // ✅ Redux 비동기 호출 시 `await` 사용
            onClose();
        } catch (error) {
            console.error("워크스페이스 생성 실패:", error);
        }
    };


    console.log("현재 JWT 토큰:", localStorage.getItem("token")); // ✅ auth.js에서 저장한 토큰 키 사용



    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" mb={2}>
                    워크스페이스 생성
                </Typography>

                {/* 워크스페이스 이름 입력 필드 */}
                <TextField
                    fullWidth
                    label="워크스페이스 이름"
                    variant="outlined"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    sx={{ mb: 2 }}
                />

                {/* ✅ 아바타 + 사진 업로드 & 제거 버튼 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mb: 2 }}>
                    <Avatar
                        src={previewImage || ''}
                        sx={{ width: 80, height: 80, mb: 1, bgcolor: '#ccc' }}
                    >
                        {!previewImage && <PhotoCameraIcon />}
                    </Avatar>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* 파일 업로드 버튼 */}
                        <Button variant="outlined" component="label">
                            사진 업로드
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </Button>

                        {/* 사진 제거 버튼 (이미지가 있을 때만 보이도록) */}
                        {previewImage && (
                            <IconButton onClick={handleRemoveImage} color="error">
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* ✅ 생성하기 버튼 */}
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCreate}
                    disabled={!workspaceName.trim()}
                >
                    생성하기
                </Button>
            </Box>
        </Modal>
    );
};

export default CreateWorkspaceModal;
