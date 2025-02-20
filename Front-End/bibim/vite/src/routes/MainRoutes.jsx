import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import WorkDataPage from '../views/workdata';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
// const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
// const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
// const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const DMPage = Loadable(lazy(() => import('views/dm')));
const MeetingPage = Loadable(lazy(() => import('views/meeting')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const ReferencePage = Loadable(lazy(() => import('views/workdata')));
const CalendarView = Loadable(lazy(() => import('views/schedule/calendar')));
const GanttView = Loadable(lazy(() => import('views/schedule/gantt')));
const OverallView = Loadable(lazy(() => import('views/schedule/overall')));
const WsSettingPage = Loadable(lazy(() => import('views/ws-setting')));
const ProfileUpdatePage = Loadable(lazy(() => import('views/profile_update')));
const MyPage = Loadable(lazy(() => import('views/mypage')));

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
      path: '/ws-setting',
      element: <WsSettingPage />
    },
    {
      path: '/mypage',
      element: <MyPage />
    },
    {
      path: '/profile_update',
      element: <ProfileUpdatePage />
    }
  ]
};

export default MainRoutes;
