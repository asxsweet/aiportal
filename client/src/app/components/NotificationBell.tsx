import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Bell, CheckCheck } from 'lucide-react';

type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadUnread();
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadNotifications();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const loadUnread = async () => {
    try {
      const { data } = await api.get<{ count: number }>('/api/notifications/unread-count');
      setUnreadCount(data.count);
    } catch { /* ignore */ }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: NotificationItem[] }>('/api/notifications', {
        params: { pageSize: 20 },
      });
      setNotifications(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const markRead = async (id: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const typeIcon: Record<string, string> = {
    new_assignment: '📋',
    project_graded: '✅',
    project_submitted: '📤',
    badge_earned: '🏆',
    deadline_reminder: '⏰',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
        aria-label={t('notifications.title')}
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-red-500 text-white shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-zinc-50">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500 dark:text-zinc-400">{t('loading')}</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-400 dark:text-zinc-500">
                <Bell className="w-8 h-8" />
                <span className="text-sm">{t('notifications.empty')}</span>
              </div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n._id}
                  href={n.link || undefined}
                  onClick={(e) => {
                    if (!n.link) e.preventDefault();
                    if (!n.read) void markRead(n._id);
                    setOpen(false);
                  }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-50 dark:border-zinc-800 last:border-b-0 ${
                    n.read ? 'opacity-50' : ''
                  }`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 leading-snug">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}