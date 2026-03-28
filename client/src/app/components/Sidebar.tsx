import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Cpu,
  LogOut,
  UserCircle,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  role: 'teacher' | 'student';
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const teacherLinks = [
    { path: '/teacher/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { path: '/teacher/assignments', labelKey: 'nav.assignments', icon: FileText },
    { path: '/teacher/students', labelKey: 'nav.students', icon: Users },
    { path: '/teacher/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
    { path: '/tools', labelKey: 'nav.tools', icon: Cpu },
    { path: '/profile', labelKey: 'nav.profile', icon: UserCircle },
    { path: '/settings', labelKey: 'nav.settings', icon: Settings },
  ];

  const studentLinks = [
    { path: '/student/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { path: '/tools', labelKey: 'nav.tools', icon: Cpu },
    { path: '/profile', labelKey: 'nav.profile', icon: UserCircle },
    { path: '/settings', labelKey: 'nav.settings', icon: Settings },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <div className="fixed top-0 left-0 h-screen w-16 sm:w-16 md:w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 p-3 md:p-6 flex flex-col z-40">
      <div className="mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hidden md:block">
          {t('brand')}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-1 hidden md:block">
          {role === 'teacher' ? t('nav.teacherPortal') : t('nav.studentPortal')}
        </p>
      </div>

      <div className="md:hidden flex justify-center mb-4">
        <ThemeToggle />
      </div>

      <div className="hidden md:flex md:flex-col gap-3 mb-6">
        <div className="flex items-center gap-2">
          <ThemeToggle className="shrink-0" />
          <div className="flex-1 min-w-0">
            <LanguageSwitcher className="w-full" />
          </div>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            location.pathname === link.path ||
            (link.path !== '/' && location.pathname.startsWith(`${link.path}/`));

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center justify-center md:justify-start gap-0 md:gap-3 px-2 md:px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium hidden md:inline">{t(link.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => logout()}
        className="flex items-center justify-center md:justify-start gap-0 md:gap-3 px-2 md:px-4 py-3 rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-400 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium hidden md:inline">{t('logout')}</span>
      </button>
    </div>
  );
}
