import { getInitials, getAvatarColor } from '@/lib/utils';

export function Avatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass =
    size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : size === 'xl' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';
  const color = getAvatarColor(name);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
