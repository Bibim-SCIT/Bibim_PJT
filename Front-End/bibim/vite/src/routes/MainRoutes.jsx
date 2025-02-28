import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
// import WorkDataPage from '../views/workdata';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// sample page routing
const DMPage = Loadable(lazy(() => import('views/dm')));
const MeetingPage = Loadable(lazy(() => import('views/meeting')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const WorkDataPage = Loadable(lazy(() => import('views/workdata')));
const WdCreatePage = Loadable(lazy(() => import('views/workdata_create')));
const WdUpdatePage = Loadable(lazy(() => import('views/workdata_update')));
const CalendarView = Loadable(lazy(() => import('views/schedule/calendar')));
const GanttView = Loadable(lazy(() => import('views/schedule/gantt')));
const OverallView = Loadable(lazy(() => import('views/schedule/overall')));
const WsSelectPage = Loadable(lazy(() => import('views/ws-select')));
const WsSettingPage = Loadable(lazy(() => import('views/ws-setting')));
const MyPage = Loadable(lazy(() => import('views/mypage')));
const MyPageUpdatePage = Loadable(lazy(() => import('views/mypage_update')));
<<<<<<< HEAD
=======
const Chennel = Loadable(lazy(() => import('views/ChatComponent')));
>>>>>>> feat/websokect-chennel

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: '/dm',
      element: <DMPage />
    },
    {
      path: '/meeting',
      element: <MeetingPage />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    {
      path: '/workdata',
      element: <WorkDataPage />
    },
    {
      path: '/workdata/create',
      element: <WdCreatePage />
    },
    {
      path: '/workdata/update',
      element: <WdUpdatePage />
    },
    {
      path: '/schedule/calendar',
      element: <CalendarView />
    },
    {
      path: '/schedule/gantt',
      element: <GanttView />
    },
    {
      path: '/schedule/overall',
      element: <OverallView />
    },
    {
<<<<<<< HEAD
=======
      path: '/chennel',
      element:<Chennel />
    },
    {
>>>>>>> feat/websokect-chennel
      path: '/ws-select',
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
    }
  ]
};

export default MainRoutes;
