/**
 * src/admin/ui.jsx — عناصر واجهة لوحة الإدارة بنمط Digital Brutalism.
 *
 * قواعد النمط الصارمة:
 *  - زوايا حادة (rounded-none) وحدود سميكة 2px وظلال صلبة بإزاحة (بلا Blur)
 *  - خلفية رمادي مزرق داكن (slate-950/900) وأسطر عناوين أحادية العرض
 *  - الأزرق الكهربائي (electric) = العناصر النشطة والتركيز والروابط
 *  - الأصفر المشرق (sunbeam) = حصرياً زر الإجراء الأساسي (حفظ التعديلات)
 *  - عناوين بأحرف كبيرة + tracking واسع + شرطات/** تنسيق "طرفي"
 */
import React from 'react';

export function BrutalCard({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`bg-slate-900 border-2 border-ink-deep shadow-brutal-sm ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function BrutalLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} dir="rtl" className="block mb-1.5 font-mono text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
      {children}
    </label>
  );
}

const inputBase =
  'w-full rounded-none bg-slate-950 border-2 border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-100 ' +
  'placeholder:text-slate-600 focus:outline-none focus:border-electric focus:shadow-brutal-inset transition-colors ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';

export function BrutalInput({ className = '', invalid = false, ...props }) {
  return <input {...props} className={`${inputBase} ${invalid ? 'border-red-500' : ''} ${className}`} />;
}

export function BrutalTextarea({ className = '', ...props }) {
  return <textarea {...props} className={`${inputBase} min-h-28 leading-7 ${className}`} />;
}

/**
 * الزر الأساسي — Sunbeam Yellow. محصور في الإجراء الأهم (حفظ/تأكيد).
 */
export function PrimaryCta({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-none bg-sunbeam px-6 py-3 border-2 border-ink-deep
        font-black text-sm text-sunbeam-ink shadow-brutal-sm
        hover:bg-sunbeam-hover hover:shadow-brutal hover:-translate-y-0.5 active:translate-y-0 active:shadow-brutal-sm
        transition-all disabled:opacity-40 disabled:translate-y-0 disabled:shadow-brutal-sm disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

/** زر ثانوي نشط — Electric Blue (تنقل/تحرير/إجراءات تفاعلية) */
export function ActionButton({ className = '', variant = 'blue', children, ...props }) {
  const styles = {
    blue: 'bg-electric text-white border-ink-deep hover:bg-electric-hover',
    ghost: 'bg-transparent text-slate-300 border-slate-700 hover:border-electric hover:text-electric-soft',
    danger: 'bg-transparent text-red-400 border-red-900 hover:border-red-500',
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-none border-2 px-4 py-2 text-xs font-bold
        transition-all disabled:opacity-30 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/** شارة قفل — تُعلّم الحقول/الأزرار المحجوبة عن الدور المحدود */
export function LockBadge({ text = 'قراءة فقط' }) {
  return (
    <span dir="rtl" className="inline-flex items-center gap-1 rounded-none border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="4" y="11" width="16" height="10" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      {text}
    </span>
  );
}

export function SectionTitle({ kicker, title, children }) {
  return (
    <div dir="rtl" className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink-deep pb-4">
      <div>
        {kicker && <div className="font-mono text-[11px] font-bold tracking-[0.35em] text-electric uppercase">{kicker}</div>}
        <h2 className="mt-1 text-xl font-black text-slate-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/** إشعار حالة بسيط (خطأ/نجاح) */
export function Notice({ kind = 'error', children }) {
  const styles = {
    error: 'border-red-500 bg-red-950/60 text-red-300',
    success: 'border-emerald-500 bg-emerald-950/60 text-emerald-300',
    info: 'border-electric bg-electric/10 text-electric-soft',
  }[kind];
  return (
    <div dir="rtl" className={`rounded-none border-2 px-4 py-3 text-sm font-bold ${styles}`} role="alert">
      {children}
    </div>
  );
}

/** شبكة إدخال الكود: 6 خانات أحادية */
export function OtpBoxes({ value, onChange, disabled }) {
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');
  return (
    <div dir="ltr" className="flex justify-center gap-2" onPaste={(e) => {
      const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
      if (pasted) { e.preventDefault(); onChange(pasted); }
    }}>
      {digits.map((d, i) => (
        <input
          key={i}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={d.trim()}
          onChange={(e) => {
            const n = e.target.value.replace(/\D/g, '');
            const arr = value.padEnd(6, ' ').split('');
            arr[i] = n || ' ';
            onChange(arr.join('').replace(/\s/g, '').slice(0, 6));
            const next = e.target.parentElement.children[i + 1];
            if (n && next) next.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i].trim() && i > 0) {
              e.target.parentElement.children[i - 1].focus();
            }
          }}
          className="h-14 w-11 rounded-none border-2 border-slate-700 bg-slate-950 text-center font-mono text-2xl font-black
            text-electric-soft focus:border-electric focus:outline-none disabled:opacity-40"
        />
      ))}
    </div>
  );
}
