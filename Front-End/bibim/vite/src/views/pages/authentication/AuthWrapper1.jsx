// material-ui
import { styled } from '@mui/material/styles';

// ==============================|| AUTHENTICATION 1 WRAPPER ||============================== //
// 로그인창 뒤편의 전체 배경색 등 지정

// const AuthWrapper1 = styled('div')(({ theme }) => ({
//   // backgroundColor: theme.palette.grey[100],
//   backgroundColor: '#112D4E',
//   minHeight: '100vh'
// }));

const AuthWrapper1 = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',

  // 배경 비디오 설정
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 비디오 위에 반투명한 오버레이 추가
    zIndex: 1,
  },

  // 로그인 카드가 겹칠 때 가독성을 위해 z-index 설정
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
}));

export default AuthWrapper1;
