import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LandingPage } from '@pages/LandingPage';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import '@assets/main.css';
import { WorkspacePage } from '@pages/WorkspacePage';

export const appName = 'POLYNOTES';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage/>,
  },
  {
    path: '/login',
    element: <LoginPage/>,
  },
  {
    path: '/register',
    element: <RegisterPage/>,
  },
  {
    path: '/workspace',
    element: <WorkspacePage/>,
  },
]);

ReactDOM.createRoot(document.querySelector('#app') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
);
