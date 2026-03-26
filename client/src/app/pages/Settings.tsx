import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import SidebarLayout from '../components/SidebarLayout';
import {
  User,
  Mail,
  Lock,
  ImageIcon,
  Languages,
  Bell,
  Shield,
  Moon,
  Sun,
  Trash2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage, setToken } from '@/lib/api';
import { useAuth, type User as U } from '@/contexts/AuthContext';
import AvatarImage from '@/components/AvatarImage';

type TabId = 'account' | 'profile' | 'language' | 'notifications' | 'security' | 'appearance';

const TABS: { id: TabId; icon: typeof User }[] = [
  { id: 'account', icon: User },
  { id: 'profile', icon: ImageIcon },
  { id: 'language', icon: Languages },
  { id: 'notifications', icon: Bell },
  { id: 'appearance', icon: Moon },
  { id: 'security', icon: Shield },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshMe, logout, setSessionUser } = useAuth();
  const [active, setActive] = useState<TabId>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [lang, setLang] = useState<'en' | 'ru' | 'kz'>('en');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifAssign, setNotifAssign] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setBio(user.bio ?? '');
    setLang((user.language as 'en' | 'ru' | 'kz') || 'en');
    setNotifEmail(user.notifications?.email !== false);
    setNotifAssign(user.notifications?.assignmentUpdates !== false);
    setNotifComments(user.notifications?.comments !== false);
  }, [user]);

  const showBanner = useCallback((type: 'ok' | 'err', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  }, []);

  const applyDark = useCallback((next: boolean) => {
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('rep_theme', next ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('rep_theme');
    if (stored === 'dark') applyDark(true);
    else if (stored === 'light') applyDark(false);
  }, [applyDark]);

  const saveAccount = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { data } = await api.put<{ user: U }>('/api/users/update', { name, email });
      setSessionUser(data.user);
      showBanner('ok', t('settings.saved'));
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    setBusy(true);
    try {
      await api.put('/api/users/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showBanner('ok', t('settings.passwordUpdated'));
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const saveBio = async () => {
    setBusy(true);
    try {
      const { data } = await api.put<{ user: U }>('/api/users/update', { bio });
      setSessionUser(data.user);
      showBanner('ok', t('settings.saved'));
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onAvatar = async (f: File | null) => {
    if (!f || !user) return;
    const fd = new FormData();
    fd.append('file', f);
    setBusy(true);
    try {
      const { data } = await api.post<{ user: U }>('/api/users/avatar', fd);
      setSessionUser(data.user);
      showBanner('ok', t('settings.saved'));
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const saveLanguage = async () => {
    setBusy(true);
    try {
      const { data } = await api.put<{ user: U }>('/api/users/update', { language: lang });
      setSessionUser(data.user);
      localStorage.setItem('rep_lang', lang);
      await i18n.changeLanguage(lang);
      showBanner('ok', t('settings.saved'));
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const saveNotifications = async () => {
    setBusy(true);
    try {
      const { data } = await api.put<{ user: U }>('/api/users/update', {
        notifications: {
          email: notifEmail,
          assignmentUpdates: notifAssign,
          comments: notifComments,
        },
      });
      setSessionUser(data.user);
      showBanner('ok', t('settings.saved'));
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const logoutAll = async () => {
    setBusy(true);
    try {
      const { data } = await api.post<{ token: string; user: U }>('/api/users/logout-all');
      setToken(data.token);
      setSessionUser(data.user);
      showBanner('ok', t('settings.logoutAllDone'));
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete('/api/users/me', { data: { password: deletePassword } });
      setDeleteOpen(false);
      logout();
      navigate('/login');
    } catch (e) {
      showBanner('err', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;
  const role = user.role;

  const Toggle = ({
    checked,
    onChange,
    label,
    desc,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    desc?: string;
  }) => (
    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 cursor-pointer">
      <div>
        <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{label}</p>
        {desc ? <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{desc}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-gradient-to-r from-blue-600 to-violet-600' : 'bg-gray-300 dark:bg-zinc-600'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );

  return (
    <SidebarLayout role={role}>
      <div className="flex flex-col lg:flex-row min-h-0">
        <aside className="lg:w-56 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shrink-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-50 px-2 mb-4">{t('settings.title')}</h1>
          <nav className="space-y-1">
            {TABS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active === id
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t(`settings.tabs.${id}`)}
                <ChevronRight className="w-4 h-4 ml-auto opacity-50 lg:hidden" />
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-xl mx-auto">
            <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">{t('settings.subtitle')}</p>

            {banner && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm ${
                  banner.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                }`}
              >
                {banner.text}
              </div>
            )}

            {active === 'account' && (
              <div className="space-y-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{t('settings.accountTitle')}</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{t('settings.accountDesc')}</p>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{t('settings.changeName')}</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {t('settings.changeEmail')}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                  />
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveAccount()}
                  className="w-full rounded-xl bg-gray-900 dark:bg-zinc-100 dark:text-zinc-900 text-white py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {t('save')}
                </button>

                <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('settings.updatePassword')}
                  </h3>
                  <label className="block mb-3">
                    <span className="text-xs text-gray-500">{t('settings.currentPassword')}</span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                    />
                  </label>
                  <label className="block mb-3">
                    <span className="text-xs text-gray-500">{t('settings.newPassword')}</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy || newPassword.length < 8}
                    onClick={() => void savePassword()}
                    className="rounded-xl border border-gray-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {t('settings.updatePassword')}
                  </button>
                </div>
              </div>
            )}

            {active === 'profile' && (
              <div className="space-y-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{t('settings.profileTitle')}</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{t('settings.profileDesc')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <AvatarImage
                    avatarUrl={user.avatarUrl}
                    name={user.name}
                    className="w-20 h-20 rounded-2xl"
                    ringClassName="ring-2 ring-gray-200 dark:ring-zinc-700"
                  />
                  <div>
                    <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium cursor-pointer hover:bg-blue-700">
                      <ImageIcon className="w-4 h-4" />
                      {t('settings.uploadAvatar')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => void onAvatar(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">{t('settings.avatarHint')}</p>
                  </div>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500">{t('settings.shortBio')}</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder={t('settings.bioPlaceholder')}
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm resize-y min-h-[100px]"
                  />
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveBio()}
                  className="rounded-xl bg-gray-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 py-2.5 text-sm font-semibold"
                >
                  {t('save')}
                </button>
              </div>
            )}

            {active === 'language' && (
              <div className="space-y-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{t('settings.languageTitle')}</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{t('settings.languageDesc')}</p>
                </div>
                <div className="space-y-2">
                  {(
                    [
                      ['en', t('settings.langEn')],
                      ['ru', t('settings.langRu')],
                      ['kz', t('settings.langKz')],
                    ] as const
                  ).map(([code, label]) => (
                    <label
                      key={code}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        lang === code
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lang"
                        checked={lang === code}
                        onChange={() => setLang(code)}
                        className="text-violet-600"
                      />
                      <span className="font-medium text-gray-900 dark:text-zinc-100">{label}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveLanguage()}
                  className="rounded-xl bg-gray-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 py-2.5 text-sm font-semibold"
                >
                  {t('save')}
                </button>
              </div>
            )}

            {active === 'notifications' && (
              <div className="space-y-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{t('settings.notificationsTitle')}</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{t('settings.notificationsDesc')}</p>
                </div>
                <div className="space-y-3">
                  <Toggle checked={notifEmail} onChange={setNotifEmail} label={t('settings.notifEmail')} />
                  <Toggle checked={notifAssign} onChange={setNotifAssign} label={t('settings.notifAssignments')} />
                  <Toggle checked={notifComments} onChange={setNotifComments} label={t('settings.notifComments')} />
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveNotifications()}
                  className="rounded-xl bg-gray-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 py-2.5 text-sm font-semibold"
                >
                  {t('save')}
                </button>
              </div>
            )}

            {active === 'appearance' && (
              <div className="space-y-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{t('settings.appearanceTitle')}</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{t('settings.appearanceDesc')}</p>
                </div>
                <Toggle
                  checked={dark}
                  onChange={applyDark}
                  label={dark ? t('settings.darkMode') : t('settings.lightMode')}
                  desc={t('settings.appearanceDesc')}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => applyDark(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm"
                  >
                    <Sun className="w-4 h-4" />
                    {t('settings.lightMode')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDark(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm"
                  >
                    <Moon className="w-4 h-4" />
                    {t('settings.darkMode')}
                  </button>
                </div>
              </div>
            )}

            {active === 'security' && (
              <div className="space-y-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{t('settings.securityTitle')}</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{t('settings.securityDesc')}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void logoutAll()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-zinc-600 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <LogOut className="w-4 h-4" />
                  {t('settings.logoutAll')}
                </button>
                <p className="text-xs text-gray-500">{t('settings.logoutAllHint')}</p>

                <div className="border-t border-red-100 dark:border-red-900/50 pt-6 mt-6">
                  <p className="text-sm text-red-700 dark:text-red-400 mb-3">{t('settings.deleteWarn')}</p>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('settings.deleteAccount')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50">{t('settings.deleteConfirmTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2">{t('settings.deleteConfirmBody')}</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('settings.deleteConfirmPlaceholder')}
              className="mt-4 w-full rounded-xl border border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-sm"
            />
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="flex-1 rounded-xl border border-gray-300 dark:border-zinc-600 py-2.5 text-sm font-medium"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={busy || !deletePassword}
                onClick={() => void confirmDelete()}
                className="flex-1 rounded-xl bg-red-600 text-white py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {t('settings.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
