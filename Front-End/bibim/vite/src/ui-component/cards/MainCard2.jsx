import React, { forwardRef } from 'react';

// material-ui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// project imports
import useConfig from 'hooks/useConfig';

// constant
const headerStyle = {
    '& .MuiCardHeader-action': { mr: 0 }
};

const MainCard2 = forwardRef(function MainCard(
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
        backgroundImage, // 추가: 배경 이미지 URL
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
            {/* card header with background image */}
            {!darkTitle && title && (
                <CardHeader
                    sx={{
                        ...headerStyle,
                        ...headerSX,
                        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white'
                    }}
                    title={<Typography variant="h2" color="white">{title}</Typography>}
                    action={secondary}
                />
            )}
            {darkTitle && title && (
                <CardHeader
                    sx={{
                        ...headerStyle,
                        ...headerSX,
                        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white'
                    }}
                    title={<Typography variant="h3" color="white">{title}</Typography>}
                    action={secondary}
                />
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

export default MainCard2;
