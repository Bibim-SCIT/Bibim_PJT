import React, { forwardRef } from 'react';

// material-ui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

// project imports
import useConfig from 'hooks/useConfig';

// constant
const headerStyle = {
    '& .MuiCardHeader-action': { mr: 0 }
};

const MainCard3 = forwardRef(function MainCard(
    {
        border = false,
        boxShadow,
        children,
        content = true,
        contentClass = '',
        contentSX = {},
        headerSX = {},
        darkTitle,
        secondary,
        shadow,
        sx = {},
        title,
        backgroundImage,  // 🔹 추가: 배경 이미지 URL
        backgroundPosition = 'center', // 🔹 추가: 배경 위치
        backgroundBlur = 0, // 🔹 추가: 흐림 정도 (0 = 없음)
        backgroundBrightness = 1, // 🔹 추가: 선명도 (1 = 기본값)
        backgroundDarken = 0.3, // 🔹 추가: 어두운 배경 오버레이 (0.3 = 기본)
        ...others
    },
    ref
) {
    const { mode } = useConfig();
    const defaultShadow = '0 2px 14px 0 rgb(32 40 45 / 8%)';

    return (
        <Card
            ref={ref}
            {...others}
            sx={{
                border: border ? '1px solid' : 'none',
                borderColor: 'divider',
                ':hover': {
                    boxShadow: boxShadow ? shadow || defaultShadow : 'inherit'
                },
                ...sx
            }}
        >
            {/* 배경이 있는 CardHeader */}
            {!darkTitle && title && (
                <Box sx={{ position: 'relative', minHeight: '120px' }}>
                    {backgroundImage && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: backgroundPosition, // 🔹 배경 위치 조정 가능
                                filter: `blur(${backgroundBlur}px) brightness(${backgroundBrightness})`, // 🔹 흐림 및 선명도 조정
                                zIndex: 1
                            }}
                        />
                    )}
                    {/* 어두운 오버레이 */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: `rgba(0, 0, 0, ${backgroundDarken})`, // 🔹 어두운 효과 조절 가능
                            zIndex: 2
                        }}
                    />
                    <CardHeader
                        sx={{
                            ...headerStyle,
                            ...headerSX,
                            position: 'relative',
                            zIndex: 3, // 🔹 글자가 배경 위에 있도록 설정
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white'
                        }}
                        title={<Typography variant="h2" color="white">{title}</Typography>}
                        action={secondary}
                    />
                </Box>
            )}

            {/* content & header divider */}
            {title && <Divider />}

            {/* card content */}
            {content && (
                <CardContent sx={contentSX} className={contentClass}>
                    {children}
                </CardContent>
            )}
            {!content && children}
        </Card>
    );
});

export default MainCard3;
