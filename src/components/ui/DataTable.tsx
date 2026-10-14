import { type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyState,
  onRowClick,
  actions,
}: {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
}) {
  if (loading) {
    return (
      <div className="px-6">
        <div className="space-y-3 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-ink-100 rounded animate-pulse flex-1" style={{ animationDelay: `${(i + j) * 80}ms` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="text-right px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-ink-100 last:border-0 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-ink-50' : 'hover:bg-ink-50/50'
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-sm text-ink-700 ${col.className || ''}`}>
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
