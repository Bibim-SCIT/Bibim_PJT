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
                height: '30vh', // 전체 화면 높이로 중앙 정렬
            }}
        >
            <Lottie
                animationData={loadingAnimation}
                style={{ width: 150, height: 150 }}
            />
            <Typography variant="h3" sx={{ mt: 2 }}>
                자료실 데이터 로딩중...
            </Typography>
        </Box>
    );
};

export default LoadingScreen;
