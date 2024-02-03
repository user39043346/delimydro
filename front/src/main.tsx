import ReactDOM from 'react-dom/client';
import '@/index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AuthProvider from '@/routes/auth';
import Root from '@/routes/root';
import ErrorAlertProvider from './routes/alert';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <ErrorAlertProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ErrorAlertProvider>,
  // </React.StrictMode>,
);
