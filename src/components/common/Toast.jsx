import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Toast() {
  const { toast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/15 max-w-md text-xs sm:text-sm font-semibold">
        {icons[toast.type] || icons.success}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
