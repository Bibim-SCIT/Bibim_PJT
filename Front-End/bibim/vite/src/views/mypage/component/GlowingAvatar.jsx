import React from 'react';
import { Avatar, Box } from '@mui/material';
import { keyframes } from '@emotion/react';

// 일렁거리는 효과 애니메이션
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

const AvatarContainer = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '160px',  // Avatar보다 살짝 크게 설정
    height: '160px', // Avatar보다 살짝 크게 설정
};

const GlowingEffect = {
    position: 'absolute',
    width: '170px',  // Avatar보다 20px 정도 크게 설정
    height: '170px',
    background: 'rgba(0, 170, 255, 0.4)',
    borderRadius: '50%',
    filter: 'blur(15px)',
    animation: `${pulseAnimation} 2s infinite ease-in-out`,
    zIndex: 0, // Avatar보다 뒤로 가도록 설정
};

const avatarStyle = {
    width: '150px',
    height: '150px',
    border: '4px solid white',
    boxShadow: '0 0 15px rgba(0, 170, 255, 0.8)',
    position: 'relative',
    zIndex: 1, // GlowingEffect보다 앞으로 배치
};

const GlowingAvatar = ({ src, alt }) => {
    return (
        <Box sx={AvatarContainer}>
            <Box sx={GlowingEffect} />
            <Avatar sx={avatarStyle} src={src} alt={alt} />
        </Box>
    );
};

export default GlowingAvatar;
