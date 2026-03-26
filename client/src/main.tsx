import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import './i18n';
import { AuthProvider } from './contexts/AuthContext';

if (typeof document !== 'undefined') {
  const theme = localStorage.getItem('rep_theme');
  if (theme === 'dark') document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
  