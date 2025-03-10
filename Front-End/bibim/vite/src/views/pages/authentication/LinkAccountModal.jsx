import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const LinkAccountModal = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>구글 로그인 연동</DialogTitle>
            <DialogContent>
                해당 구글 계정을 연동하시겠습니까?
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>아니오</Button>
                <Button onClick={onConfirm}>예</Button>
            </DialogActions>
        </Dialog>
    );
};

export default LinkAccountModal;
