import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';

// project imports
import { LOGO_PATH } from 'config';
import Logo from 'ui-component/Logo';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link component={RouterLink} to={LOGO_PATH} aria-label="theme-logo">
      <Logo />
    </Link>
  );
}
