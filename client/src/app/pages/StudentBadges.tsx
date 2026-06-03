import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { Award, BookOpen, Trophy, Star, Target, Shield, Lightbulb, Presentation, Brain, TrendingUp, Zap } from 'lucide-react';

type Badge = {
  _id: string;
  type: string;
  earnedAt: string;
};

const BADGE_ICONS: Record<string, typeof Award> = {
  first_project: BookOpen,
  three_projects: BookOpen,
  five_projects: BookOpen,
  ten_projects: Trophy,
  high_score: Star,
  excellent_score: Award,
  perfect_score: Trophy,
  algorithm_master: Brain,
  presentation_pro: Presentation,
  problem_solver: Lightbulb,
  innovation_star: Zap,
  safety_first: Shield,
  early_bird: Target,
  streak_three: TrendingUp,
};

const BADGE_COLORS: Record<string, string> = {
  first_project: 'from-blue-400 to-blue-600',
  three_projects: 'from-blue-500 to-indigo-600',
  five_projects: 'from-indigo-500 to-purple-600',
  ten_projects: 'from-purple-500 to-pink-600',
  high_score: 'from-green-400 to-emerald-600',
  excellent_score: 'from-emerald-500 to-teal-600',
  perfect_score: 'from-yellow-400 to-amber-600',
  algorithm_master: 'from-cyan-400 to-blue-600',
  presentation_pro: 'from-pink-400 to-rose-600',
  problem_solver: 'from-orange-400 to-red-600',
  innovation_star: 'from-violet-400 to-purple-600',
  safety_first: 'from-green-500 to-green-700',
  early_bird: 'from-amber-400 to-yellow-600',
  streak_three: 'from-red-400 to-pink-600',
};

export default function StudentBadges() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ badges: Badge[] }>('/api/badges/mine');
        if (!cancelled) setBadges(data.badges);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('badges.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const earnedTypes = new Set(badges.map((b) => b.type));

  const allBadges = [
    'first_project', 'three_projects', 'five_projects', 'ten_projects',
    'high_score', 'excellent_score', 'perfect_score',
    'algorithm_master', 'presentation_pro', 'problem_solver', 'innovation_star', 'safety_first',
    'early_bird', 'streak_three',
  ];

  return (
    <SidebarLayout role="student">
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-zinc-50">{t('badges.title')}</h1>
            <p className="text-gray-600 dark:text-zinc-400">{t('badges.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">{error}</div>
          )}

          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
          ) : (
            <>
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{badges.length}</h2>
                    <p className="text-sm opacity-90">{t('badges.earnedCount', { count: badges.length })}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-zinc-50">{t('badges.allBadges')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allBadges.map((type) => {
                  const earned = earnedTypes.has(type);
                  const Icon = BADGE_ICONS[type] || Award;
                  const color = BADGE_COLORS[type] || 'from-gray-400 to-gray-600';
                  const badge = badges.find((b) => b.type === type);

                  return (
                    <div
                      key={type}
                      className={`relative rounded-xl p-5 border-2 transition-all ${
                        earned
                          ? 'border-transparent shadow-lg hover:shadow-xl'
                          : 'border-gray-200 dark:border-zinc-700 opacity-40 grayscale'
                      }`}
                    >
                      {earned && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-10`} />
                      )}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                          earned ? `bg-gradient-to-br ${color} text-white` : 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-zinc-100">
                          {t(`badges.${type}`)}
                        </h3>
                        {earned && badge ? (
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-zinc-600">{t('badges.locked')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}