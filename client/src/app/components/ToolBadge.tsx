import { useTranslation } from 'react-i18next';

interface ToolBadgeProps {
  tool: 'ev3' | 'tinkercad';
  size?: 'sm' | 'md';
}

export default function ToolBadge({ tool, size = 'md' }: ToolBadgeProps) {
  const { t } = useTranslation();
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const isEv3 = tool === 'ev3';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        isEv3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
      } ${sizeClass}`}
    >
      {isEv3 ? t('tools.ev3') : t('tools.tinkercad')}
    </span>
  );
}
