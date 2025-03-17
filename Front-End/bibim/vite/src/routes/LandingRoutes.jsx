import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

// Landing Page Import
const LandingPage = Loadable(lazy(() => import('views/landing')));

const LandingRoutes = {
    path: '/',
    element: <LandingPage />  // ✅ 랜딩 페이지를 최상위 경로(`/`)로 설정
};

export default LandingRoutes;
