import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
// import WorkDataPage from '../views/workdata';

// dashboard routing
// const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// sample page routing
const DMPage = Loadable(lazy(() => import('views/dm')));
const MeetingPage = Loadable(lazy(() => import('views/meeting')));
const WorkDataPage = Loadable(lazy(() => import('views/workdata')));
const WdCreatePage = Loadable(lazy(() => import('views/workdata_create')));
const WdUpdatePage = Loadable(lazy(() => import('views/workdata_update')));
const SchedulePage = Loadable(lazy(() => import('views/schedule')));
const OverallView = Loadable(lazy(() => import('views/schedule/overall')));
const WsSelectPage = Loadable(lazy(() => import('views/ws-select')));
const WsSettingPage = Loadable(lazy(() => import('views/ws-setting')));
const MyPage = Loadable(lazy(() => import('views/mypage')));
const MyPageUpdatePage = Loadable(lazy(() => import('views/mypage_update')));
const ChannelPage = Loadable(lazy(() => import('views/ws-channel')));
const WsRoleSetting = Loadable(lazy(() => import('views/ws-role/WsRoleSetting')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    // {
    //   path: 'dashboard',
    //   children: [
    //     {
    //       path: 'default',
    //       element: <DashboardDefault />
    //     }
    //   ]
    // },
    {
      path: '/dm',
      element: <DMPage />
    },
    // {
    //   path: '/meeting',
    //   element: <MeetingPage />
    // },
    {
      path: '/workdata',
      element: <WorkDataPage />
    },
    {
      path: '/workdata/create',
      element: <WdCreatePage />
    },
    {
      path: '/workdata/update/:wsId/:dataNumber', // ✅ 동적 라우트 적용
      element: <WdUpdatePage />
    },
    {
      path: '/schedule',
      element: <SchedulePage />
    },
    {
      path: '/schedule/overall',
      element: <OverallView />
    },
    {
      path: '/channel',
      element: <ChannelPage />
    },
    {
      path: '/',
      element: <WsSelectPage />
    },
    {
      path: '/ws-setting',
      element: <WsSettingPage />
    },
    {
      path: '/mypage',
      element: <MyPage />
    },
    {
      path: '/mypage/update',
      element: <MyPageUpdatePage />
    },
    {
      path: '/workspace/role',
      element: <WsRoleSetting />
    }
  ]
};

export default MainRoutes;
