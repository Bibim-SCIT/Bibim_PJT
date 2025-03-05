import { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { withdrawMember } from '../../../api/members';

const style = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 24,
    p: 0,
    position: 'relative',
    outline: 'none'
};

const WithdrawalModal = ({ open, handleClose }) => {
    const [password, setPassword] = useState('');

    const handleWithdrawal = async () => {
        try {
            const response = await withdrawMember(password);
            console.log(response.message);
            handleClose();
        } catch (error) {
            console.error('회원 탈퇴 실패:', error.message);
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
        >
            <Box sx={style}>
                <Box sx={{ p: 3, pb: 2 }}>
                    <IconButton
                        onClick={handleClose}
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
                        회원 탈퇴
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
                        <WarningIcon
                            sx={{
                                fontSize: 40,
                                color: '#ff4444',
                                mb: 2
                            }}
                        />
                        <Typography sx={{ mb: 1 }}>
                            회원 탈퇴를 진행하시려면 비밀번호를 입력해주세요.
                        </Typography>
                        <Typography
                            color="error"
                            sx={{
                                fontSize: '0.875rem',
                                fontStyle: 'italic'
                            }}
                        >
                            ※ 탈퇴 시 모든 데이터는 복구할 수 없습니다.
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        type="password"
                        label="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 3 }}
                    />
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
                        onClick={handleClose}
                        sx={{
                            color: '#666',
                            borderColor: '#666',
                            boxShadow: 'none'
                        }}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleWithdrawal}
                        sx={{
                            bgcolor: '#ff4444',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#ff0000',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        탈퇴하기
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default WithdrawalModal; 