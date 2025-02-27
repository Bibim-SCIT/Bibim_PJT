import { useState } from 'react';
import { Box, Grid, Typography, TextField, Button } from '@mui/material';

export default function InviteWorkspace({ onInvite }) {
    const [inviteCode, setInviteCode] = useState('');

    const handleInvite = () => {
        if (inviteCode.trim() !== '') {
            onInvite(inviteCode);
            setInviteCode('');
        }
    };

    return (
        <Box
            sx={{
                p: 3,
                border: '1px solid #ddd',
                borderRadius: 2,
                width: '85%',  // 좌우 80~90% 영역 차지
                maxWidth: 600, // 최대 너비 지정
                mx: 'auto', // 가운데 정렬
                textAlign: 'center' // 텍스트 중앙 정렬
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>
                초대받은 워크스페이스가 있나요?
            </Typography>

            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={8}>
                    <TextField
                        fullWidth
                        label="초대 코드 입력"
                        variant="outlined"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />
                </Grid>
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        sx={{ width: '100px' }} // 버튼 크기 조정
                        onClick={handleInvite}
                    >
                        인증
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
}
