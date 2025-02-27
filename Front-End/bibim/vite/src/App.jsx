import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// redux
import { Provider } from 'react-redux';
import store from './store/workspaceStore';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';

// auth provider

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <Provider store={store}>
      <ThemeCustomization>
        <NavigationScroll>
          <>
            <RouterProvider router={router} />
          </>
        </NavigationScroll>
      </ThemeCustomization>
    </Provider>
  );
}
