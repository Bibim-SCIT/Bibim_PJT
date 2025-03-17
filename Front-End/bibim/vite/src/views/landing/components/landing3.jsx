// material-ui
import Typography from '@mui/material/Typography';
import { Box, Button, Container, Grid, Stack, useTheme, Paper, Divider, IconButton, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// project imports
import LogoSection from 'layout/MainLayout/LogoSection';
import LandingHeader from './components/LandingHeader';
import ProfileSection from 'layout/MainLayout/Header/ProfileSection';

// 스타일 컴포넌트
const HeaderSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  marginBottom: theme.spacing(20)
}));

const HeaderNav = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const GradientText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(90deg, #FF6B6B 0%, #FFD166 50%, #06D6A0 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent'
}));

const FeatureBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  borderRadius: '20px',
  background: '#fff',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, #FF6B6B 0%, #FFD166 50%, #06D6A0 100%)'
  }
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

// ==============================|| Landing PAGE 3 ||============================== //

export default function LandingPage3() {
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

  // 랜딩 페이지 선택으로 돌아가기
  const backToLandingSelect = () => {
    navigate("/landing");
  };

  // 랜딩 페이지 4로 이동
  const moveToLanding4 = () => {
    navigate("/landing4");
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

  const features = [
    {
      title: '직관적인 인터페이스',
      description: '누구나 쉽게 사용할 수 있는 직관적인 사용자 인터페이스를 제공합니다.',
      icon: '🎨'
    },
    {
      title: '실시간 협업',
      description: '팀원들과 실시간으로 소통하고 협업할 수 있는 환경을 제공합니다.',
      icon: '👥'
    },
    {
      title: '강력한 보안',
      description: '최고 수준의 보안 시스템으로 데이터를 안전하게 보호합니다.',
      icon: '🔒'
    },
    {
      title: '데이터 분석',
      description: '프로젝트 데이터를 분석하여 인사이트를 제공합니다.',
      icon: '📊'
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
      
      {/* 헤더 섹션 */}
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
              onClick={scrollToDashboard}
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
        
        {/* 이미지 섹션 */}
        <Box 
          id="dashboard-section"
          sx={{ 
            width: '100%',
            height: { xs: '300px', md: '500px' },
            bgcolor: '#f5f5f5',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Typography variant="h3" sx={{ color: 'text.secondary', opacity: 0.5 }}>
            비빔 대시보드 이미지
          </Typography>
        </Box>
      </Container>
      
      {/* 기능 섹션 */}
      <Box sx={{ bgcolor: '#fff', py: 15 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontWeight: 700,
              mb: 2
            }}
          >
            주요 기능
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              color: 'text.secondary',
              mb: 8,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            비빔은 팀 협업에 필요한 모든 기능을 제공합니다
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureBox>
                  <Typography variant="h1" sx={{ mb: 2, opacity: 0.8 }}>
                    {feature.icon}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {feature.description}
                  </Typography>
                </FeatureBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* CTA 섹션 */}
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
              onClick={moveToLanding4}
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)'
                }
              }}
            >
              랜딩 페이지 4 보기
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 