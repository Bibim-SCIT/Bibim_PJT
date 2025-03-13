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
        // backgroundColor: 'rgba(255, 255, 255, 0.8)', // 배경을 70% 투명하게 설정
        backdropFilter: 'blur(10px)', // 블러 효과 추가 (더 부드러운 느낌)
        display: 'flex', // ✅ 내부 요소 정렬
        flexDirection: 'column', // ✅ 요소들을 세로로 정렬
        maxHeight: '90vh', // ✅ 뷰포트의 80%까지만 카드가 커지도록 제한
        overflowY: 'auto', // ✅ 폼이 길면 스크롤 가능하도록 설정
        '& > *': {
          flexGrow: 1,
          flexBasis: '50%'
        },
        // ✅ 스크롤바 디자인 수정
        '&::-webkit-scrollbar': {
          width: '6px' // 스크롤바 두께 조정
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)', // 스크롤바 색상 투명하게 설정
          borderRadius: '10px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent' // 스크롤바 트랙을 투명하게 설정
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
