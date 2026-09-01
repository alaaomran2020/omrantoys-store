// ============================================================
// OMRAN TOYS — Admin UI Primitives
// مكونات واجهة موحدة للوحة التحكم.
// ============================================================
import React, { useState } from 'react';
import {
  AlertTriangle, X, Check, ChevronDown, Info, Lightbulb, Loader2,
} from 'lucide-react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-slate-100 text-toy-red">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = 'default', sub }) {
  const tones = {
    default: 'bg-slate-100 text-slate-700',
    red: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400">{label}</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${tones[tone]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = 'primary', disabled, type = 'button', className = '' }) {
  const variants = {
    primary: 'bg-toy-red hover:bg-rose-600 text-white shadow-sm',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white',
    outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, tone = 'green' }) {
  const tones = {
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${tones[tone]} transition-all`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function HealthRing({ score }) {
  if (score === null || score === undefined) {
    return (
      <div className="flex items-center justify-center w-28 h-28 rounded-full border-8 border-slate-200 text-center p-2">
        <span className="text-[11px] font-bold text-slate-400">غير متاح حالياً</span>
      </div>
    );
  }
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900">{score}</span>
        <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="py-12 text-center">
      {Icon && <Icon className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />}
      <p className="text-sm font-bold text-slate-600">{title}</p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-2 rounded-xl bg-toy-red/10 text-toy-red">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h2 className="text-base font-black text-slate-900">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, hint, required, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold text-slate-600 block mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-[10px] text-slate-400 block mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls = 'w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-toy-red focus:ring-2 focus:ring-toy-red/10';

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer"
    >
      <span className={`w-9 h-5 rounded-full p-0.5 transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
      {label && <span className="text-xs font-bold text-slate-600">{label}</span>}
    </button>
  );
}

export function StatusPill({ status }) {
  const map = {
    ok: { tone: 'green', label: 'سليم', icon: Check },
    healthy: { tone: 'green', label: 'سليم', icon: Check },
    warning: { tone: 'amber', label: 'تحذير', icon: AlertTriangle },
    warn: { tone: 'amber', label: 'تحذير', icon: AlertTriangle },
    critical: { tone: 'red', label: 'حرج', icon: AlertTriangle },
    info: { tone: 'blue', label: 'معلومة', icon: Info },
  };
  const m = map[status] || map.info;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
      m.tone === 'green' ? 'bg-emerald-100 text-emerald-700'
      : m.tone === 'amber' ? 'bg-amber-100 text-amber-700'
      : m.tone === 'red' ? 'bg-rose-100 text-rose-700'
      : 'bg-blue-100 text-blue-700'
    }`}>
      <Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}

export function NextStep({ step }) {
  if (!step) return null;
  const tones = {
    critical: 'border-rose-200 bg-rose-50 text-rose-800',
    high: 'border-amber-200 bg-amber-50 text-amber-800',
    medium: 'border-blue-200 bg-blue-50 text-blue-800',
    low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };
  const labels = { critical: 'حرج', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
  return (
    <div className={`rounded-2xl border p-4 ${tones[step.priority] || tones.low}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Lightbulb className="w-4 h-4" />
        <span className="text-[11px] font-black uppercase tracking-wide">الخطوة التالية</span>
        <span className="text-[10px] font-bold bg-white/60 px-1.5 py-0.5 rounded-full">{labels[step.priority] || ''}</span>
      </div>
      <p className="text-sm font-black">{step.title}</p>
      {step.detail && <p className="text-xs mt-1 opacity-90">{step.detail}</p>}
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'تأكيد', danger = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
        <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${danger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-black text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-4">{message}</p>
        <div className="flex gap-2">
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
        </div>
      </div>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[80] space-y-2 max-w-xs">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2 p-3 rounded-xl shadow-lg text-xs font-bold text-white ${t.type === 'error' ? 'bg-rose-600' : t.type === 'info' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <Check className="w-4 h-4" />
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="opacity-70 hover:opacity-100 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, notify, dismiss };
}

export function Select({ value, onChange, options, className = '' }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} cursor-pointer ${className}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function IconChevron({ open }) {
  return <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />;
}

export function Spinner() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}
