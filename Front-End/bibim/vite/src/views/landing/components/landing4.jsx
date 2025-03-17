// material-ui
import Typography from '@mui/material/Typography';
import { Box, Button, Container, Grid, Stack, useTheme, Paper, Divider, IconButton, AppBar, Toolbar, Avatar, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// project imports
import LogoSection from 'layout/MainLayout/LogoSection';
import LandingHeader from './components/LandingHeader';
import ProfileSection from 'layout/MainLayout/Header/ProfileSection';
import { IconMenu2, IconUsers, IconMessage, IconCalendarEvent, IconFileAnalytics, IconBrandGithub } from '@tabler/icons-react';

// 스타일 컴포넌트
const GradientText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(90deg, #FF6B6B 0%, #FFD166 50%, #06D6A0 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent'
}));

const CircleDecoration = styled(Box)(({ theme, position }) => ({
  position: 'absolute',
  width: '300px',
  height: '300px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 209, 102, 0.1) 50%, rgba(6, 214, 160, 0.1) 100%)',
  filter: 'blur(40px)',
  ...position
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(6),
  fontWeight: 700,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -16,
    left: 0,
    width: '60px',
    height: '3px',
    backgroundColor: theme.palette.primary.main
  }
}));

const SectionTitleCenter = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(6),
  fontWeight: 700,
  textAlign: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -16,
    left: 'calc(50% - 30px)',
    width: '60px',
    height: '3px',
    backgroundColor: theme.palette.primary.main
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  backgroundColor: '#fff',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
  }
}));

const ScreenshotBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '400px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative'
}));

const FeatureIcon = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  backgroundColor: theme.palette.primary.light,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.dark
}));

// ==============================|| Landing PAGE 4 ||============================== //

export default function LandingPage4() {
  const navigate = useNavigate();
  const theme = useTheme();

  // 페이지 이동
  const moveMain = () => {
    navigate("/");
  };

  // 로그인 페이지로 이동
  const moveToLogin = () => {
    navigate("/pages/login");
  };

  // 회원가입 페이지로 이동
  const moveToSignup = () => {
    navigate("/pages/register");
  };

  // 워크스페이스 선택 페이지로 이동
  const moveToWorkspace = () => {
    navigate("/ws-select");
  };

  // 다른 랜딩 페이지로 이동
  const moveLandingPage = (pageNumber) => {
    navigate(`/landing${pageNumber}`);
  };

  // 대시보드 섹션으로 스크롤
  const scrollToDashboard = () => {
    const dashboardSection = document.getElementById('dashboard-section');
    const offset = 100; // 헤더 높이 등을 고려한 오프셋
    const targetPosition = dashboardSection.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  };

  // 기능 섹션으로 스크롤
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    const offset = 80; // 헤더 높이 등을 고려한 오프셋
    const targetPosition = featuresSection.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  };

  // 플랫폼 섹션으로 스크롤
  const scrollToPlatform = () => {
    const platformSection = document.getElementById('platform-section');
    const offset = 80; // 헤더 높이 등을 고려한 오프셋
    const targetPosition = platformSection.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  };

  const features = [
    {
      title: '스마트 협업 공간',
      description: '팀원들과 효율적으로 협업할 수 있는 다양한 도구를 제공합니다. 프로젝트 진행 상황을 실시간으로 공유하고 함께 작업할 수 있습니다.',
      icon: <IconUsers stroke={1.5} size="28px" />
    },
    {
      title: '실시간 소통 채널',
      description: '팀원들과 실시간으로 소통할 수 있는 채팅 기능을 제공합니다. 언제 어디서나 빠르게 메시지를 주고받을 수 있습니다.',
      icon: <IconMessage stroke={1.5} size="28px" />
    },
    {
      title: '스마트 일정 관리',
      description: '팀의 일정을 체계적으로 관리하고 공유할 수 있습니다. 중요한 마감일과 이벤트를 놓치지 않고 효율적으로 시간을 관리하세요.',
      icon: <IconCalendarEvent stroke={1.5} size="28px" />
    },
    {
      title: '통합 자료 허브',
      description: '문서, 이미지, 파일 등 다양한 형식의 자료를 체계적으로 저장하고 공유할 수 있습니다. 필요한 자료를 언제든지 쉽게 찾아볼 수 있습니다.',
      icon: <IconFileAnalytics stroke={1.5} size="28px" />
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: '#FAFAFA', 
      minHeight: '100vh',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      pb: 0
    }}>
      {/* 헤더 */}
      <AppBar enableColorOnDark position="fixed" color="inherit" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Toolbar sx={{ p: 2 }}>
          <LandingHeader />
        </Toolbar>
      </AppBar>
      
      <Box sx={{ mt: 8 }}>
        <CircleDecoration position={{ top: '-150px', right: '-150px' }} />
        <CircleDecoration position={{ bottom: '-150px', left: '-150px' }} />
      </Box>
      
      {/* 히어로 섹션 (랜딩페이지 3에서 가져옴) */}
      <Container maxWidth="lg" sx={{ pt: 16, pb: 15 }}>
        <Box sx={{ textAlign: 'center', mb: 20, position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              lineHeight: 1.2,
              mb: 3
            }}
          >
            비빔과 함께<br />
            <GradientText>창의적인 협업</GradientText>을 경험하세요
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              maxWidth: '700px', 
              mx: 'auto', 
              mb: 6,
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            비빔은 팀의 생산성을 높이고 효율적인 협업을 가능하게 하는 
            혁신적인 플랫폼입니다. 지금 바로 시작해보세요.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              size="large"
              onClick={moveToWorkspace}
              sx={{ 
                bgcolor: '#111', 
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#333'
                }
              }}
            >
              워크스페이스 선택하기
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={scrollToPlatform}
              sx={{ 
                borderColor: '#111',
                color: '#111',
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)',
                  borderColor: '#000'
                }
              }}
            >
              더 알아보기
            </Button>
          </Stack>
        </Box>
      </Container>
      
      

      {/* 비디오 섹션 (랜딩 index에서 가져옴) */}
      <Box 
        id="platform-section"
        sx={{ 
        py: 10, 
        bgcolor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.03)'
      }}>
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <SectionTitle variant="h3">
                비빔 플랫폼 살펴보기
              </SectionTitle>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  color: 'text.secondary',
                  lineHeight: 1.7
                }}
              >
                비빔의 다양한 기능과 사용법을 확인해보세요.
                직관적인 인터페이스와 강력한 협업 도구를 통해 팀의 생산성을 높이고 효율적인 업무 환경을 구축하는 방법을 알아볼 수 있습니다.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  onClick={moveToSignup}
                  sx={{
                    bgcolor: '#111',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#333'
                    }
                  }}
                >
                  가입하기
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={scrollToPlatform}
                  sx={{
                    borderColor: '#111',
                    color: '#111',
                    '&:hover': {
                      borderColor: '#000',
                      bgcolor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  더 알아보기
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 80px rgba(0, 0, 0, 0.1)',
                  width: '100%',
                  height: { xs: '300px', md: '500px' },
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                  alt="비빔 사용 사례" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 기능 섹션 (랜딩 index에서 가져옴) */}
      <Box sx={{ py: 10, bgcolor: theme.palette.background.default }} id="features-section">
        <Container>
          <SectionTitleCenter variant="h2">
            비빔의 주요 기능
          </SectionTitleCenter>
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              mb: 8, 
              maxWidth: '700px', 
              mx: 'auto',
              color: 'text.secondary'
            }}
          >
            비빔은 팀 협업에 필요한 모든 기능을 한 곳에서 제공합니다.
            실시간 채팅, 협업 도구, 일정 관리, 자료실까지 - <br />
            효율적인 팀워크를 위한 완벽한 솔루션을 경험해보세요.
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard>
                  <CardContent sx={{ p: 3 }}>
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA 섹션 (랜딩 3 스타일로 변경) */}
      <Box 
        sx={{ 
          pt: { xs: 10, md: 15 }, 
          pb: 0,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          mt: 'auto',
          mb: 0
        }}
      >
        <Container maxWidth="md" sx={{ pb: 0 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: 'text.primary'
            }}
          >
            지금 바로 비빔을 시작하세요
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            더 나은 협업과 생산성 향상을 위한 첫 걸음을 시작하세요
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: 0 }}
          >
            <Button 
              variant="contained" 
              size="large"
              onClick={moveToWorkspace}
              sx={{ 
                bgcolor: '#111', 
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 600,
                mb: 0,
                '&:hover': {
                  bgcolor: '#333'
                }
              }}
            >
              워크스페이스 선택하기
            </Button>
          </Stack>
          
          <Box sx={{ mt: 5, pb: 5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              다른 랜딩 페이지 스타일 보기
            </Typography>
            <Button 
              variant="text" 
              onClick={() => moveLandingPage(3)}
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)'
                }
              }}
            >
              랜딩 페이지 3 보기
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 