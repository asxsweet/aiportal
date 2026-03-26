import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bot, Mail, Lock, User as UserIcon, School } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, user } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
  });
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
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setPending(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role,
        institution: formData.institution || undefined,
      });
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
          <p className="text-gray-600">{t('auth.createSubtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">{t('auth.createTitle')}</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                role === 'student'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              {t('auth.student')}
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                role === 'teacher'
                  ? 'border-purple-500 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              {t('auth.teacher')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.institution')}
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60"
            >
              {pending ? t('loading') : t('auth.createButton')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
