import { useToasts, dismissToast } from './toast.store';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const toasts = useToasts();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : Info;
        const colors =
          t.type === 'success'
            ? 'bg-success-50 border-success-200 text-success-800'
            : t.type === 'error'
            ? 'bg-error-50 border-error-200 text-error-800'
            : 'bg-primary-50 border-primary-200 text-primary-800';
        const iconColor =
          t.type === 'success'
            ? 'text-success-600'
            : t.type === 'error'
            ? 'text-error-600'
            : 'text-primary-600';

        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-lg border shadow-elevated animate-slideIn ${colors}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
