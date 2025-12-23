import React from 'react';
import { useNotifier } from '../contexts/NotificationContext';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useNotifier();

  const ICONS = {
    success: <CheckCircle className="text-emerald-500" />,
    error: <XCircle className="text-red-500" />,
    info: <Info className="text-blue-500" />,
  };
  
  const BORDER_COLORS = {
      success: 'border-emerald-500/50',
      error: 'border-red-500/50',
      info: 'border-blue-500/50'
  };

  return (
    <div className="fixed top-8 right-8 z-[100] space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`w-80 bg-rs-card border-l-4 ${BORDER_COLORS[toast.type]} rounded-lg shadow-2xl p-4 flex items-start gap-3 animate-fade-in-right`}
        >
          <div className="flex-shrink-0 mt-1">{ICONS[toast.type]}</div>
          <p className="flex-1 text-sm text-slate-200">{toast.message}</p>
        </div>
      ))}
       <style>{`
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right { animation: fade-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
};