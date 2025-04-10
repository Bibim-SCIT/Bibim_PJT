// src/components/LoadingScreen.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
// 로컬 JSON 파일 사용 (또는 URL 사용 가능)
import loadingAnimation from '../../../assets/images/lottie/chatload.json';

const ChannelLoading = ({ text = "채널 불러오는중..." }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%', // 부모 컨테이너의 높이에 맞춤
            }}
        >
            <Lottie
                animationData={loadingAnimation}
                style={{ width: 300, height: 300 }}
            />
            <Typography variant="h2" sx={{ mt: 2 }}>
                {text}
            </Typography>
        </Box>
    );
};

export default ChannelLoading;
