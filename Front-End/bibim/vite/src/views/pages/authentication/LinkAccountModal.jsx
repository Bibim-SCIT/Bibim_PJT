import React from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Modal, 
    Divider, 
    IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * 구글 계정 연동 확인 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.open - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {Function} props.onConfirm - 연동 확인 시 호출할 함수
 */
const LinkAccountModal = ({ open, onClose, onConfirm }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="link-account-modal"
            aria-describedby="link-account-confirmation"
        >
            <Box sx={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 24,
                p: 0,
                position: 'absolute',
                outline: 'none'
            }}>
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
                        구글 로그인 연동
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e0e0e0' }} />

                <Box sx={{ p: 3 }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <InfoOutlinedIcon
                            sx={{
                                fontSize: 40,
                                color: '#8e58cd',
                                mb: 2
                            }}
                        />
                        <Typography sx={{ mb: 1, textAlign: 'center' }}>
                            해당 구글 계정을 연동하시겠습니까?
                        </Typography>
                    </Box>
                    
                    {/* 안내 메시지 */}
                    <Box sx={{ 
                        bgcolor: '#f5f5f5', 
                        p: 1.5, 
                        borderRadius: 1, 
                        borderLeft: '3px solid #8e58cd',
                        mt: 2
                    }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'text.secondary',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <InfoOutlinedIcon 
                                sx={{ 
                                    fontSize: '16px', 
                                    mr: 1.8,
                                    color: 'text.secondary'
                                }} 
                            />
                            연동하면 구글 계정으로 간편하게 로그인할 수 있습니다.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{
                            color: '#666',
                            borderColor: '#666',
                            boxShadow: 'none'
                        }}
                    >
                        닫기
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onConfirm}
                        sx={{
                            bgcolor: '#6a36b6',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#5c2da3',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        연동하기
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default LinkAccountModal;
