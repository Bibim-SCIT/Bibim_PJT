// material-ui
import Typography from '@mui/material/Typography';
import { Box, Button, Container, Grid, Stack, useTheme, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './components/LandingHeader';
import LogoSection from 'layout/MainLayout/LogoSection';
import ProfileSection from 'layout/MainLayout/Header/ProfileSection';
import NotificationSection from 'layout/MainLayout/Header/NotificationSection';

// 스타일 컴포넌트
const HeaderSection = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: 100
}));

const HeaderNav = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
}));

const HeroSection = styled(Box)(({ theme }) => ({
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(12, 0),
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: 'url("https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80")',
    backgroundSize: 'cover',
    filter: 'grayscale(30%) brightness(140%)',
    backgroundPosition: 'center',
    borderRadius: theme.spacing(2),
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 0
    }
}));

const FeatureCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
    backdropFilter: 'blur(4px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-10px)'
    }
}));

// ==============================|| Landing PAGE 1 ||============================== //

export default function LandingPage1() {
    const navigate = useNavigate();
    const theme = useTheme();

    // 페이지 이동
    const moveMain = () => {
        navigate("/");
    };

    // 워크스페이스 선택 페이지로 이동
    const moveToWorkspace = () => {
        navigate("/ws-select");
    };

    // 로그인 페이지로 이동
    const moveToLogin = () => {
        navigate("/login");
    };

    // 랜딩 페이지 선택으로 돌아가기
    const backToLandingSelect = () => {
        navigate("/landing");
    };

    return (
        <Box sx={{ bgcolor: theme.palette.background.default }}>
            {/* 헤더 */}
            <AppBar enableColorOnDark position="fixed" color="inherit" elevation={0} sx={{ bgcolor: 'background.default' }}>
                <Toolbar sx={{ p: 2 }}>
                    <LandingHeader />
                </Toolbar>
            </AppBar>
            
            <Container maxWidth="xl" sx={{ py: 8, mt: 8 }}>
                <HeroSection>
                    <Container sx={{ position: 'relative', zIndex: 1 }}>
                        <Grid container spacing={6} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography 
                                    variant="h1" 
                                    sx={{ 
                                        fontWeight: 700, 
                                        mb: 2,
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        color: '#fff'
                                    }}
                                >
                                    비빔에 오신 것을 환영합니다
                                </Typography>
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        mb: 4, 
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: 400
                                    }}
                                >
                                    당신의 꿈을 현실로 만들어 보세요
                                </Typography>
                                <Stack direction="row" spacing={3}>
                                    <Button 
                                        size="large" 
                                        variant="contained" 
                                        onClick={moveToWorkspace}
                                        sx={{ 
                                            bgcolor: '#fff', 
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.9)'
                                            }
                                        }}
                                    >
                                        지금 시작하기
                                    </Button>
                                    <Button 
                                        size="large" 
                                        variant="outlined" 
                                        onClick={moveToLogin}
                                        sx={{ 
                                            borderColor: '#fff', 
                                            color: '#fff',
                                            '&:hover': {
                                                borderColor: 'rgba(255, 255, 255, 0.9)',
                                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                    >
                                        로그인
                                    </Button>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box 
                                    sx={{ 
                                        width: '100%', 
                                        height: '400px',
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: theme.spacing(2),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Typography variant="h3" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                        비빔 이미지
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </HeroSection>

                <Box sx={{ py: 16, mt: 8 }}>
                    <Typography 
                        variant="h2" 
                        align="center" 
                        sx={{ 
                            mb: 6, 
                            fontWeight: 600,
                            position: 'relative',
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                width: '80px',
                                height: '4px',
                                bottom: '-16px',
                                left: 'calc(50% - 40px)',
                                backgroundColor: theme.palette.primary.main
                            }
                        }}
                    >
                        주요 기능
                    </Typography>
                    
                    <Grid container spacing={6}>
                        {[
                            { title: '혁신적인 디자인', desc: '최신 트렌드를 반영한 모던한 UI/UX를 경험해보세요.' },
                            { title: '강력한 성능', desc: '빠른 속도와 안정적인 서비스를 제공합니다.' },
                            { title: '맞춤형 서비스', desc: '사용자의 니즈에 맞는 맞춤형 솔루션을 제공합니다.' }
                        ].map((feature, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <FeatureCard>
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1">
                                        {feature.desc}
                                    </Typography>
                                </FeatureCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box sx={{ py: 12, mt: 8, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ mb: 5 }}>
                        지금 바로 시작하세요
                    </Typography>
                    <Stack direction="column" spacing={3} alignItems="center">
                        <Button 
                            size="large" 
                            variant="contained" 
                            color="primary" 
                            onClick={moveToWorkspace}
                            sx={{ 
                                px: 6, 
                                py: 1.5,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                borderRadius: '50px',
                                minWidth: '240px'
                            }}
                        >
                            지금 시작하기
                        </Button>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body1" sx={{ mr: 1, color: theme.palette.text.secondary }}>
                                이미 계정이 있으신가요?
                            </Typography>
                            <Button 
                                variant="text" 
                                color="primary"
                                onClick={moveToLogin}
                                sx={{ 
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                로그인
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
} 