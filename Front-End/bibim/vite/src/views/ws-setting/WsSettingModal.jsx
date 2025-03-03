import { useState } from 'react';
import { 
    Modal, 
    Box, 
    Typography, 
    TextField, 
    Button,
    IconButton,
    Avatar
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
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

    const handleSubmit = async () => {
        try {
            await updateWorkspace(
                workspace.wsName,  // 현재 워크스페이스 이름
                newName,          // 새로운 이름
                newImage          // 새로운 이미지 파일 (없으면 null)
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
                <Typography variant="h6" component="h2">
                    워크스페이스 설정
                </Typography>

                {/* 이미지 업로드 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <Avatar
                        src={imagePreview}
                        sx={{ width: 100, height: 100, mb: 1 }}
                    />
                    <input
                        accept="image/*"
                        type="file"
                        id="icon-button-file"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="icon-button-file">
                        <IconButton color="primary" component="span">
                            <PhotoCamera />
                        </IconButton>
                    </label>
                </Box>

                {/* 워크스페이스 이름 입력 */}
                <TextField
                    label="워크스페이스 이름"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    fullWidth
                />

                {/* 버튼 그룹 */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button onClick={handleClose} color="inherit">
                        취소
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default WsSettingModal; 