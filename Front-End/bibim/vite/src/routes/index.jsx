import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import LandingRoutes from './LandingRoutes';  // ✅ 랜딩 페이지 라우트 다시 추가

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([LandingRoutes, MainRoutes, AuthenticationRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
