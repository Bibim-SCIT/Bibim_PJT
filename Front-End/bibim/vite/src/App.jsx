import { RouterProvider } from 'react-router-dom';
import { useContext } from "react";
import { ConfigContext } from "contexts/ConfigContext";

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
  const context = useContext(ConfigContext);
  console.log("🔍 ConfigContext 내부 상태:", context);


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
