// material-ui
import Typography from '@mui/material/Typography';
import { Box, Button, Container, Grid, Stack, useTheme, IconButton, Divider, Avatar, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// project imports
import LogoSection from 'layout/MainLayout/LogoSection';
import LandingHeader from './components/LandingHeader';
import ProfileSection from 'layout/MainLayout/Header/ProfileSection';
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

// ==============================|| Landing PAGE 2 ||============================== //

export default function LandingPage2() {
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
      <AppBar enableColorOnDark position="fixed" color="inherit" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Toolbar sx={{ p: 2 }}>
          <LandingHeader />
        </Toolbar>
      </AppBar>

      {/* 히어로 섹션 */}
      <Box sx={{ mt: 8 }}>
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
                    maxWidth: '500px'
                  }}
                >
                  비빔은 팀의 생산성을 높이고 효율적인 협업을 가능하게 하는 
                  혁신적인 플랫폼입니다. 지금 바로 시작해보세요.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={moveToWorkspace}
                    sx={{ 
                      bgcolor: theme.palette.primary.main, 
                      color: '#fff',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                  >
                    워크스페이스 선택하기
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={scrollToFeatures}
                    sx={{ 
                      borderColor: '#fff',
                      color: '#fff',
                      '&:hover': {
                        borderColor: '#fff',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
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
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                    alt="비빔 대시보드" 
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </HeroSection>
      </Box>
      
      {/* 기능 섹션 */}
      <Box sx={{ py: 10 }} id="features-section">
        <Container>
          <SectionTitleCenter variant="h2">
            비빔 채팅의 주요 기능
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
            실시간 채팅, 파일 공유, 일정 관리까지 - 효율적인 팀워크를 위한 완벽한 솔루션을 경험해보세요.
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
                비빔 채팅 살펴보기
              </SectionTitle>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  color: 'text.secondary',
                  lineHeight: 1.7
                }}
              >
                비빔 채팅의 다양한 기능과 사용법을 확인해보세요.
                직관적인 인터페이스와 강력한 협업 도구를 통해 팀의 생산성을 높이고 효율적인 업무 환경을 구축하는 방법을 알아볼 수 있습니다.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={moveToSignup}
                >
                  가입하기
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={moveToWorkspace}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: 'rgba(99, 102, 241, 0.1)'
                    }
                  }}
                >
                  워크스페이스 선택하기
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
      
      {/* 통계 섹션 */}
      <Box sx={{ py: 10, bgcolor: theme.palette.primary.light }}>
        <Container>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  10,000+
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  활성 사용자
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  5,000+
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  팀 워크스페이스
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  99.9%
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  가용성
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* CTA 섹션 */}
      <Box 
        sx={{ 
          py: 10, 
          bgcolor: theme.palette.primary.main,
          color: '#fff',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 3
            }}
          >
            지금 바로 비빔을 경험해보세요
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            비빔과 함께 팀의 생산성을 높이고 효율적인 협업을 시작하세요.
            지금 가입하면 모든 기능을 무료로 이용할 수 있습니다.
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
                bgcolor: '#fff', 
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              워크스페이스 선택하기
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={moveToSignup}
              sx={{ 
                borderColor: '#fff',
                color: '#fff',
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              가입하기
            </Button>
          </Stack>
          
          <Box sx={{ mt: 8 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              다른 랜딩 페이지 스타일 보기
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="text" 
                onClick={() => moveLandingPage(1)}
                sx={{ 
                  color: '#fff',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                랜딩 페이지 1
              </Button>
              <Button 
                variant="text" 
                onClick={() => moveLandingPage(3)}
                sx={{ 
                  color: '#fff',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                랜딩 페이지 3
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
      
      {/* 푸터 */}
      <Box sx={{ py: 5, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                비빔
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                효율적인 팀 협업을 위한 최고의 솔루션
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <IconBrandGithub size={20} />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    제품
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      기능
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      가격
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      보안
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    회사
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      소개
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      블로그
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      채용
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    리소스
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      문서
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      튜토리얼
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      FAQ
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    법적 고지
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      이용약관
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      개인정보처리방침
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            © 2023 비빔. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
} 