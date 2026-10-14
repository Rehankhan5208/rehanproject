import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Loader2 className={`${sizeClass} animate-spin text-primary-600`} />
      {label && <span className="text-sm text-ink-500">{label}</span>}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      <p className="text-sm text-ink-500 font-medium">Loading...</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center mb-4 text-ink-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-ink-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function Badge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'primary';
}) {
  const colors = {
    neutral: 'bg-ink-100 text-ink-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    primary: 'bg-primary-100 text-primary-700',
  };
  return <span className={`badge ${colors[variant]}`}>{children}</span>;
}
