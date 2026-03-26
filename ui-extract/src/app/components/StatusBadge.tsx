interface StatusBadgeProps {
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
    },
    submitted: {
      label: 'Submitted',
      color: 'bg-blue-100 text-blue-800',
    },
    graded: {
      label: 'Graded',
      color: 'bg-green-100 text-green-800',
    },
    overdue: {
      label: 'Overdue',
      color: 'bg-red-100 text-red-800',
    },
  };

  const { label, color } = config[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
