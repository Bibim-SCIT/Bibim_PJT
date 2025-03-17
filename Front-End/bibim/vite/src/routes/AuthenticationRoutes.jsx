import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));

// landing page
const LandingPage = Loadable(lazy(() => import('views/landing')));
const LandingPage1 = Loadable(lazy(() => import('views/landing/landing1')));
const LandingPage2 = Loadable(lazy(() => import('views/landing/landing2')));
const LandingPage3 = Loadable(lazy(() => import('views/landing/landing3')));
const LandingPage4 = Loadable(lazy(() => import('views/landing/landing4')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/',
      element: <LandingPage />
    },
    {
      path: '/pages/login',
      element: <LoginPage />
    },
    {
      path: '/pages/register',
      element: <RegisterPage />
    },
    {
      path: '/landing',
      element: <LandingPage />
    },
    {
      path: '/landing1',
      element: <LandingPage1 />
    },
    {
      path: '/landing2',
      element: <LandingPage2 />
    },
    {
      path: '/landing3',
      element: <LandingPage3 />
    },
    {
      path: '/landing4',
      element: <LandingPage4 />
    }
  ]
};

export default AuthenticationRoutes;
