import React from 'react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const iconMap = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
};

const bgMap = {
  success: 'bg-white border-emerald-200',
  warning: 'bg-white border-amber-200',
  info: 'bg-white border-blue-200',
  error: 'bg-white border-red-200',
};

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 min-w-[280px] max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right-5 duration-300',
            bgMap[toast.type]
          )}
          role="alert"
        >
          {iconMap[toast.type]}
          <p className="text-sm text-gray-700 flex-1 font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
