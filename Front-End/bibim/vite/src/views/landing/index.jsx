// material-ui
import Typography from '@mui/material/Typography';
import { Box, Button, Container, Grid, Stack, useTheme, Divider, Avatar, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// project imports
import LogoSection from 'layout/MainLayout/LogoSection';
import ProfileSection from 'layout/MainLayout/Header/ProfileSection';
import NotificationSection from 'layout/MainLayout/Header/NotificationSection';
import { IconMenu2, IconUsers, IconMessage, IconCalendarEvent, IconFileAnalytics, IconBrandGithub } from '@tabler/icons-react';

// 스타일 컴포넌트
const HeaderSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(1, 0),
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

const HeaderNavList = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4)
}));

const HeaderNavItem = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    color: theme.palette.primary.main,
    '&::after': {
      width: '100%'
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -5,
    left: 0,
    width: 0,
    height: '2px',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease'
  }
}));

const EntryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  fontWeight: 700,
  padding: theme.spacing(1, 3),
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  backgroundImage: 'url("https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'grayscale(30%) brightness(140%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
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

  // 랜딩 페이지 선택으로 돌아가기
  const backToLandingSelect = () => {
    navigate("/landing");
  };

  // 워크스페이스 선택 페이지로 이동
  const moveToWorkspace = () => {
    navigate("/ws-select");
  };

  // 다른 랜딩 페이지로 이동
  const moveLandingPage = (pageNumber) => {
    navigate(`/landing${pageNumber}`);
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
    <Box sx={{ bgcolor: theme.palette.background.default }}>
      {/* 헤더 */}
      <HeaderSection>
        <Container>
          <HeaderNav>
            <Box sx={{ width: 228, display: 'flex' }}>
              <Box component="span" sx={{ flexGrow: 1 }}>
                <LogoSection />
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={3} alignItems="center">
              <Button 
                variant="text" 
                size="small"
                onClick={moveToLogin}
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    backgroundColor: theme.palette.primary.main,
                    transition: 'width 0.3s ease'
                  },
                  '&:hover': {
                    backgroundColor: 'transparent',
                    '&::after': {
                      width: '100%'
                    }
                  }
                }}
              >
                로그인
              </Button>
              <Button 
                variant="contained" 
                size="small"
                onClick={moveToSignup}
                sx={{ 
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  borderRadius: '4px',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    backgroundColor: theme.palette.primary.dark
                  }
                }}
              >
                회원가입
              </Button>
            </Stack>
          </HeaderNav>
        </Container>
      </HeaderSection>

      {/* 히어로 섹션 */}
      <HeroSection>
        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#fff'
                }}
              >
                팀워크의 새로운 차원,<br />
                비빔과 함께하세요
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                비빔은 팀의 생산성을 높이고 효율적인 협업을 가능하게 하는 
                올인원 협업 플랫폼입니다. 실시간 소통, 프로젝트 관리, 일정 관리까지 
                모든 것을 한 곳에서 해결하세요.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={moveMain}
                  sx={{ 
                    bgcolor: '#fff', 
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  지금 시작하기
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={scrollToFeatures}
                  sx={{ 
                    borderColor: '#fff',
                    color: '#fff',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#fff',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  더보기
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScreenshotBox>
                {/* 스크린샷박스 비움 */}
              </ScreenshotBox>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>


      {/* 기능 섹션 */}
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
            실시간 채팅, 협업 도구, 일정 관리, 자료실까지 - 효율적인 팀워크를 위한 완벽한 솔루션을 경험해보세요.
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

      {/* 비디오 섹션 */}
      <Box sx={{ py: 10, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
        <Container>
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
                  color="primary"
                  onClick={moveMain}
                >
                  지금 시작하기
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={moveMain}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: 'rgba(99, 102, 241, 0.1)'
                    }
                  }}
                >
                  둘러보기
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScreenshotBox sx={{ bgcolor: theme.palette.background.default }}>
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                  alt="비빔 사용 사례" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </ScreenshotBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA 섹션 */}
      <Box sx={{ py: 10, bgcolor: theme.palette.primary.main, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: '#fff'
            }}
          >
            지금 바로 비빔을 경험해보세요
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 5, 
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            더 나은 협업과 생산성 향상을 위한 첫 걸음을 시작하세요.
            비빔과 함께라면 팀의 잠재력을 최대한 발휘할 수 있습니다.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              size="large"
              onClick={moveMain}
              sx={{ 
                bgcolor: '#fff', 
                color: theme.palette.primary.main,
                fontWeight: 600,
                py: 1.5, 
                px: 4,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              메인으로 이동
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={backToLandingSelect}
              sx={{ 
                borderColor: '#fff',
                color: '#fff',
                fontWeight: 600,
                py: 1.5, 
                px: 4,
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              랜딩 선택으로 돌아가기
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
} 