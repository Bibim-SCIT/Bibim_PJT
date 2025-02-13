import PropTypes from 'prop-types';
// material-ui
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| AUTHENTICATION CARD WRAPPER ||============================== //
// 로그인창 카드에 대한 UI 수정 부분 

export default function AuthCardWrapper({ children, ...other }) {
  return (
    <MainCard
      sx={{
        maxWidth: { xs: 400, lg: 475 },
        margin: { xs: 2.5, md: 3 },
        // backgroundColor: 'rgba(255, 255, 255, 0.7)', // 배경을 70% 투명하게 설정
        backdropFilter: 'blur(10px)', // 블러 효과 추가 (더 부드러운 느낌)
        '& > *': {
          flexGrow: 1,
          flexBasis: '50%'
        }
      }}
      content={false}
      {...other}
    >
      <Box sx={{ p: { xs: 2, sm: 3, xl: 5 } }}>{children}</Box>
    </MainCard>
  );
}

AuthCardWrapper.propTypes = { children: PropTypes.any, other: PropTypes.any };
