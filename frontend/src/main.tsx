import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Tooltip } from 'primereact/tooltip';
import RealtimeUpdatesListener from './components/RealtimeUpdatesListener';
import RateLimitDialog from './components/RateLimitiDialog';


import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RealtimeUpdatesListener />
    <RateLimitDialog />
    <Tooltip target="[data-pr-tooltip]" />
    <RouterProvider router={router} />
  </React.StrictMode>
);
