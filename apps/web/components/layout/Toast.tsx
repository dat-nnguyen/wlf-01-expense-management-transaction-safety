import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="fixed bottom-6 right-6 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 z-50 text-xs font-semibold animate-slideUp">
      <CheckCircle2 className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};
