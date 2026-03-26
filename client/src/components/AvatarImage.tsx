import { useEffect, useState } from 'react';
import { apiStaticUrl } from '@/lib/mediaUrl';

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

type Props = {
  avatarUrl: string | null | undefined;
  name: string;
  className?: string;
  ringClassName?: string;
};

/**
 * Shows profile photo from `/api/avatars-files/...` or fallback initials if missing / load error.
 */
export default function AvatarImage({
  avatarUrl,
  name,
  className = 'w-28 h-28 rounded-2xl',
  ringClassName = 'ring-4 ring-white dark:ring-zinc-900',
}: Props) {
  const src = apiStaticUrl(avatarUrl ?? undefined);
  const [failed, setFailed] = useState(false);
  const initials = initialsFromName(name);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`${className} ${ringClassName} shadow-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-bold text-white`}
        aria-hidden
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={`${className} ${ringClassName} shadow-xl object-cover border border-gray-200/80 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800`}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
    />
  );
}
