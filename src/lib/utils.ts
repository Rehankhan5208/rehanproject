export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const avatarColors = [
  'bg-primary-600',
  'bg-accent-600',
  'bg-success-600',
  'bg-warning-600',
  'bg-error-600',
  'bg-ink-600',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function calculateGrade(percentage: number): { grade: string; variant: 'success' | 'warning' | 'error' | 'primary' } {
  if (percentage >= 90) return { grade: 'A+', variant: 'success' };
  if (percentage >= 80) return { grade: 'A', variant: 'success' };
  if (percentage >= 70) return { grade: 'B', variant: 'primary' };
  if (percentage >= 60) return { grade: 'C', variant: 'warning' };
  if (percentage >= 50) return { grade: 'D', variant: 'warning' };
  return { grade: 'F', variant: 'error' };
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 85) return 'text-success-600';
  if (percentage >= 75) return 'text-warning-600';
  return 'text-error-600';
}
