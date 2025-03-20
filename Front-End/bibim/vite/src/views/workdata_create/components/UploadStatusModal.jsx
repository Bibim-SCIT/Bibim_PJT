// src/components/UploadStatusModal.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../assets/images/lottie/loading2.json'; // 로딩 애니메이션 JSON
import successAnimation from '../../../assets/images/lottie/success.json'; // 성공 애니메이션 JSON

const UploadStatusModal = ({ open, status, message, onConfirm }) => {
    // status: "loading", "success" (실패 상태 등은 별도 처리 가능)
    return (
        <Dialog
            open={open}
            PaperProps={{
                sx: { width: '500px', maxWidth: '500px' }
            }}
        >
            <DialogTitle
                sx={{ display: 'flex', alignItems: 'center' }}
            >{status === 'loading' ? '자료글 등록중..' : '등록 성공'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {status === 'loading' ? (
                        <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} />
                    ) : (
                        <Lottie animationData={successAnimation} style={{ width: 150, height: 150 }} />
                    )}
                    <Typography sx={{ mt: 2 }}>{message}</Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-end', padding: 2 }}>
                {status !== 'loading' && (
                    <Button onClick={onConfirm} color="secondary" variant="contained">
                        확인
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default UploadStatusModal;