import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from './routes';

function App() {
  const { theme } = useTheme();
  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme={theme} position="top-right" richColors closeButton duration={4000} />
    </>
  );
}

export default App;
