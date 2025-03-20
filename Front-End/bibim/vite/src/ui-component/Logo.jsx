// material-ui
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import rabbit from 'assets/images/icons/rabbit.png';
import bibim from 'assets/images/icons/bibim250319.png';

// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    <img src={bibim} alt="Bibim" width="150" height="50" />
  );
}
