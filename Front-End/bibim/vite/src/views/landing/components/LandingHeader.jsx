// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// project imports
import LogoSection from 'layout/MainLayout/LogoSection';
import ProfileSection from 'layout/MainLayout/Header/ProfileSection';
import NotificationSection from 'layout/MainLayout/Header/NotificationSection';

// assets
import { IconMenu2 } from '@tabler/icons-react';

// ==============================|| LANDING NAVBAR / HEADER ||============================== //

export default function LandingHeader() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
      </Box>

      {/* header search */}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />

      {/* notification */}
      <NotificationSection />

      {/* profile */}
      <ProfileSection />
    </>
  );
} 