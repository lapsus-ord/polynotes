import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import { AppRoutes } from '@/AppRoutes';
import { store } from '@/store';
import '@assets/main.css';
import moment from 'moment';
import 'moment/dist/locale/fr';

export const appName = 'Polynotes';
moment.locale('fr');

const App = () => {
  const routes = AppRoutes();

  return (
    <StrictMode>
      <Provider store={store}>
        <GeistProvider>
          <CssBaseline/>
          <RouterProvider router={routes}/>
        </GeistProvider>
      </Provider>
    </StrictMode>
  );
};

createRoot(document.querySelector('#app') as HTMLElement).render(<App/>);
