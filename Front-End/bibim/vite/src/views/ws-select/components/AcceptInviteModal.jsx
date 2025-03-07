// src/views/ws-select/components/AcceptInviteModal.jsx
import { Modal, Box, Typography, Button } from '@mui/material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    textAlign: 'center'
};

export default function AcceptInviteModal({ open, onClose }) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    초대 수락 완료
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    워크스페이스에 가입되었습니다!!
                </Typography>
                <Button variant="contained" onClick={onClose}>
                    확인
                </Button>
            </Box>
        </Modal>
    );
}
