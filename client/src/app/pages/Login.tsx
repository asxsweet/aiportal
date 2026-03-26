import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bot, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', {
      replace: true,
    });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err, t('error')));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bot className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {t('brand')}
            </h1>
          </div>
          <p className="text-gray-600">{t('auth.welcomeBack')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">{t('auth.loginTitle')}</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">{t('auth.remember')}</span>
              </label>
              <span className="text-gray-400 cursor-not-allowed">{t('auth.forgot')}</span>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60"
            >
              {pending ? t('loading') : t('auth.loginTitle')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              {t('auth.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
