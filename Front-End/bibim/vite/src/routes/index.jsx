import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import LandingRoutes from './LandingRoutes';  // ✅ 랜딩 페이지 라우트 다시 추가

// ==============================|| ROUTING RENDER ||============================== //

// 라우트 우선순위: 랜딩 페이지 > 인증 라우트 > 메인 라우트
const router = createBrowserRouter([LandingRoutes, AuthenticationRoutes, MainRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
