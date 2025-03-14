// src/components/LoadingScreen.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
// 로컬 JSON 파일 사용 (또는 URL 사용 가능)
import loadingAnimation from '../../../assets/images/lottie/loading1.json';

const LoadingScreen = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh', // 전체 화면 높이로 중앙 정렬
            }}
        >
            <Lottie
                animationData={loadingAnimation}
                style={{ width: 300, height: 300 }}
            />
            <Typography variant="h2" sx={{ mt: 2 }}>
                워크스페이스 불러오는중...
            </Typography>
        </Box>
    );
};

export default LoadingScreen;
