import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import SidebarLayout from '../components/SidebarLayout';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Users,
  BarChart3,
  Activity as ActivityIcon,
  Settings,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth, type User } from '@/contexts/AuthContext';
import AvatarImage from '@/components/AvatarImage';

type RecentProject = {
  id: string;
  title: string;
  assignmentTitle: string;
  status: string;
  submittedAt: string;
};

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  at: string;
  href?: string;
};

type StudentStats = {
  assignmentsCompleted: number;
  assignmentsSubmitted: number;
  avgScore: number | null;
  recentProjects: RecentProject[];
};

type TeacherStats = {
  totalStudents: number;
  totalAssignments: number;
  avgClassPerformance: number | null;
};

function ProfileCollapsible({
  title,
  Icon,
  count,
  defaultOpen,
  children,
  emptyHint,
  iconClassName,
  t,
}: {
  title: string;
  Icon: LucideIcon;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
  emptyHint?: string;
  iconClassName?: string;
  t: TFunction;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const hint = open ? t('profile.tapToCollapse') : t('profile.tapToExpand');
  const iconCls =
    iconClassName ?? 'text-gray-800 dark:text-zinc-200';

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-5 h-5 shrink-0 ${iconCls}`} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-semibold text-gray-900 dark:text-zinc-50">{title}</span>
              <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                ({t('profile.itemsCount', { count })})
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-zinc-400 mt-0.5">{hint}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-gray-700 dark:text-zinc-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>
      {open && (
        <div className="border-t border-gray-200 dark:border-zinc-700 px-4 py-3 bg-gray-50/80 dark:bg-zinc-950/50">
          {count === 0 && emptyHint ? (
            <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">{emptyHint}</p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{
          user: User;
          stats: StudentStats | TeacherStats;
          activity: ActivityItem[];
          profileCompletion: number;
        }>('/api/users/me');
        if (cancelled) return;
        setUser(data.user);
        setActivity(data.activity);
        setCompletion(data.profileCompletion);
        if (data.user.role === 'student') setStudentStats(data.stats as StudentStats);
        else setTeacherStats(data.stats as TeacherStats);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('profile.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const role = authUser?.role ?? user?.role ?? 'student';
  const display = user ?? authUser;

  const activityLabel = (type: string) => {
    const k = `profile.activityTypes.${type}` as const;
    return t(k, type);
  };

  const created = useMemo(() => {
    if (!display?.createdAt) return '—';
    try {
      return new Date(display.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  }, [display?.createdAt]);

  if (!authUser) return null;

  return (
    <SidebarLayout role={role}>
      <div className="p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
                {t('profile.title')}
              </h1>
              <p className="text-gray-700 dark:text-zinc-300 mt-1">{t('profile.subtitle')}</p>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:opacity-95 transition-opacity"
            >
              <Settings className="w-4 h-4" />
              {t('profile.editSettings')}
            </Link>
          </div>

          {loading && (
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-16 flex justify-center">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-3 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {!loading && display && (
            <>
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="h-14 sm:h-16 bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600" aria-hidden />
                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    <AvatarImage avatarUrl={display.avatarUrl} name={display.name} />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 truncate">
                          {display.name}
                        </h2>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            display.role === 'teacher'
                              ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                          }`}
                        >
                          {display.role === 'teacher'
                            ? t('profile.roleTeacher')
                            : t('profile.roleStudent')}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-zinc-200 flex items-center gap-2 text-sm font-medium">
                        <Mail className="w-4 h-4 shrink-0 text-gray-500 dark:text-zinc-400" />
                        {display.email}
                      </p>
                      <p className="text-gray-700 dark:text-zinc-300 text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-500 dark:text-zinc-400" />
                        {t('profile.memberSince')} {created}
                      </p>
                    </div>
                    <div className="w-full sm:w-56 shrink-0 sm:pt-0">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          {t('profile.completionTitle')}
                        </span>
                        <span className="tabular-nums">{completion}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 mt-2 leading-snug">
                        {t('profile.completionHint')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    {t('profile.infoTitle')}
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                      <dt className="text-gray-800 dark:text-zinc-300 font-medium">{t('profile.fullName')}</dt>
                      <dd className="font-semibold text-gray-950 dark:text-zinc-50 text-right">
                        {display.name}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                      <dt className="text-gray-800 dark:text-zinc-300 font-medium">{t('profile.email')}</dt>
                      <dd className="font-semibold text-gray-950 dark:text-zinc-50 text-right break-all">
                        {display.email}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                      <dt className="text-gray-800 dark:text-zinc-300 font-medium">{t('profile.role')}</dt>
                      <dd className="font-semibold text-gray-950 dark:text-zinc-50 text-right">
                        {display.role === 'teacher'
                          ? t('profile.roleTeacher')
                          : t('profile.roleStudent')}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-2">
                      <dt className="text-gray-800 dark:text-zinc-300 font-medium">{t('profile.memberSince')}</dt>
                      <dd className="font-semibold text-gray-950 dark:text-zinc-50">{created}</dd>
                    </div>
                    {(display.bio || '').trim() ? (
                      <div className="pt-2">
                        <dt className="text-gray-800 dark:text-zinc-300 font-medium mb-1">{t('profile.bio')}</dt>
                        <dd className="text-gray-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                          {display.bio}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    {t('profile.statsTitle')}
                  </h3>
                  {role === 'student' && studentStats && (
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700">
                        <span className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-2 font-medium">
                          <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          {t('profile.studentCompleted')}
                        </span>
                        <span className="text-xl font-bold text-gray-950 dark:text-white tabular-nums">
                          {studentStats.assignmentsCompleted}
                        </span>
                      </li>
                      <li className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700">
                        <span className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-2 font-medium">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          {t('profile.studentSubmitted')}
                        </span>
                        <span className="text-xl font-bold text-gray-950 dark:text-white tabular-nums">
                          {studentStats.assignmentsSubmitted}
                        </span>
                      </li>
                      <li className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700">
                        <span className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-2 font-medium">
                          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                          {t('profile.studentAvg')}
                        </span>
                        <span className="text-xl font-bold text-gray-950 dark:text-white tabular-nums">
                          {studentStats.avgScore != null ? `${studentStats.avgScore}%` : '—'}
                        </span>
                      </li>
                    </ul>
                  )}
                  {role === 'teacher' && teacherStats && (
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700">
                        <span className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-2 font-medium">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          {t('profile.teacherStudents')}
                        </span>
                        <span className="text-xl font-bold text-gray-950 dark:text-white tabular-nums">
                          {teacherStats.totalStudents}
                        </span>
                      </li>
                      <li className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700">
                        <span className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-2 font-medium">
                          <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                          {t('profile.teacherAssignments')}
                        </span>
                        <span className="text-xl font-bold text-gray-950 dark:text-white tabular-nums">
                          {teacherStats.totalAssignments}
                        </span>
                      </li>
                      <li className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700">
                        <span className="text-sm text-gray-800 dark:text-zinc-200 flex items-center gap-2 font-medium">
                          <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          {t('profile.teacherAvg')}
                        </span>
                        <span className="text-xl font-bold text-gray-950 dark:text-white tabular-nums">
                          {teacherStats.avgClassPerformance != null
                            ? `${teacherStats.avgClassPerformance}%`
                            : '—'}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              {role === 'student' && studentStats && studentStats.recentProjects.length > 0 && (
                <ProfileCollapsible
                  title={t('profile.recentProjects')}
                  Icon={BookOpen}
                  count={studentStats.recentProjects.length}
                  defaultOpen={false}
                  iconClassName="text-blue-600 dark:text-blue-400"
                  t={t}
                >
                  <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {studentStats.recentProjects.map((p) => (
                      <li key={p.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 first:pt-0">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-zinc-50">{p.title}</p>
                          <p className="text-xs text-gray-700 dark:text-zinc-400 mt-0.5">{p.assignmentTitle}</p>
                        </div>
                        <Link
                          to={`/project/${p.id}`}
                          className="text-sm font-semibold text-blue-700 dark:text-blue-300 hover:underline shrink-0"
                        >
                          {t('profile.viewProject')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </ProfileCollapsible>
              )}

              <ProfileCollapsible
                title={t('profile.activityTitle')}
                Icon={ActivityIcon}
                count={activity.length}
                defaultOpen={false}
                emptyHint={activity.length === 0 ? t('profile.activityEmpty') : undefined}
                iconClassName="text-emerald-600 dark:text-emerald-400"
                t={t}
              >
                {activity.length > 0 ? (
                  <ul className="space-y-2">
                    {activity.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-wrap items-start justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-violet-800 dark:text-violet-300">
                            {activityLabel(a.type)}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm mt-0.5">
                            {a.title}
                          </p>
                          {a.subtitle ? (
                            <p className="text-xs text-gray-700 dark:text-zinc-400 mt-0.5">{a.subtitle}</p>
                          ) : null}
                          <p className="text-xs text-gray-600 dark:text-zinc-500 mt-1">
                            {new Date(a.at).toLocaleString()}
                          </p>
                        </div>
                        {a.href ? (
                          <Link
                            to={a.href}
                            className="text-sm shrink-0 text-blue-700 dark:text-blue-300 font-semibold"
                          >
                            {t('profile.viewProject')}
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </ProfileCollapsible>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
