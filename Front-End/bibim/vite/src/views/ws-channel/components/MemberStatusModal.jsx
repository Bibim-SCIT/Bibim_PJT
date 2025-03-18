import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    IconButton, 
    Typography,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MemberStatusComponent from './MemberStatusComponent';

/**
 * 워크스페이스 멤버의 온라인/오프라인 상태를 모달로 표시하는 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.open - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {number} props.workspaceId - 워크스페이스 ID
 * @returns {JSX.Element} - 멤버 상태 모달 컴포넌트
 */
const MemberStatusModal = ({ open, onClose, workspaceId }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" component="div">
                        워크스페이스 멤버 접속 현황
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ color: 'grey.500' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 2 }}>
                <MemberStatusComponent workspaceId={workspaceId} />
            </DialogContent>
        </Dialog>
    );
};

export default MemberStatusModal; 