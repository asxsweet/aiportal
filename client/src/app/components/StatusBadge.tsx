import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = {
    pending: { labelKey: 'status.pending', color: 'bg-yellow-100 text-yellow-800' },
    submitted: { labelKey: 'status.submitted', color: 'bg-blue-100 text-blue-800' },
    graded: { labelKey: 'status.graded', color: 'bg-green-100 text-green-800' },
    overdue: { labelKey: 'status.overdue', color: 'bg-red-100 text-red-800' },
  } as const;

  const { labelKey, color } = config[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {t(labelKey)}
    </span>
  );
}
