import { Cpu, Box } from 'lucide-react';

interface ToolBadgeProps {
  tool: 'ev3' | 'tinkercad';
  size?: 'sm' | 'md' | 'lg';
}

export default function ToolBadge({ tool, size = 'md' }: ToolBadgeProps) {
  const config = {
    ev3: {
      label: 'LEGO Mindstorms EV3',
      color: 'from-yellow-400 to-orange-500',
      icon: Box,
    },
    tinkercad: {
      label: 'Tinkercad',
      color: 'from-cyan-400 to-blue-500',
      icon: Cpu,
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const { label, color, icon: Icon } = config[tool];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium text-white bg-gradient-to-r ${color} ${sizeClasses[size]} shadow-sm`}
    >
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  );
}
