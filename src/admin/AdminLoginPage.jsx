/**
 * src/admin/AdminLoginPage.jsx — تسجيل دخول المدراء عبر واتساب (OTP/رابط سحري).
 *
 * الدورة:
 *  ① المدير يُدخل رقم واتسابه الشخصي → POST /api/admin/auth/request-code
 *     (الخادم يتحقق أن الرقم مسجَّل كمدير، يطبّق حدود المعدل، ثم يرسل
 *      كوداً من 6 أرقام عبر WhatsApp Cloud API + رابط دخول سحري)
 *  ② يُدخل الكود من واتساب → POST /api/admin/auth/verify
 *  ③ الخادم ينشئ جلسة داخل Cookie HttpOnly (لا شيء في localStorage)
 *
 * في وضع التطوير (AUTH_DEV_MODE=1) يعرض النظام الكود مباشرة
 * حتى تُختبر الدورة كاملة بدون مزوّد واتساب حقيقي.
 */
import React, { useEffect, useRef, useState } from 'react';
import { requestCode, verifyCode } from '../lib/adminAuth';
import { BrutalCard, BrutalInput, BrutalLabel, PrimaryCta, ActionButton, Notice, OtpBoxes } from './ui';

export default function AdminLoginPage({ session, onLoggedIn, navigate }) {
  const [step, setStep] = useState('phone'); // phone → code
  const [phone, setPhone] = useState('+20');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [dev, setDev] = useState(null); // { code, url } في وضع التطوير
  const [resendIn, setResendIn] = useState(0);
  const phoneRef = useRef(null);

  // الرابط السحري: #/admin/login?t=TOKEN&p=PHONE → تحقق تلقائي
  const [magic, setMagic] = useState(() => {
    const params = new URLSearchParams((window.location.hash.split('?')[1] || ''));
    return params.get('t') ? { t: params.get('t'), p: params.get('p') || '' } : null;
  });

  useEffect(() => {
    if (session?.admin) navigate('/admin/products');
  }, [session, navigate]);

  // عدّاد إعادة الإرسال
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // التحقق التلقائي عبر الرابط السحري
  useEffect(() => {
    if (!magic) return;
    let alive = true;
    (async () => {
      try {
        await verifyCode({ token: magic.t });
        const admin = await onLoggedIn();
        if (alive && admin) navigate('/admin/products');
      } catch (err) {
        if (alive) { setError(`${err.message} — سجّل الدخول بالكود.`); setMagic(null); setStep('phone'); }
      }
    })();
    return () => { alive = false; };
  }, [magic, onLoggedIn, navigate]);

  async function handleRequestCode(e) {
    e?.preventDefault();
    setError(''); setInfo(''); setDev(null);
    setBusy(true);
    try {
      const res = await requestCode(phone.trim());
      setStep('code');
      setResendIn(res.resend_after || 60);
      setInfo(res.message || 'أرسلنا الكود إلى واتسابك');
      if (res.dev_code) setDev({ code: res.dev_code, url: res.dev_magic_url });
      setCode('');
      setTimeout(() => document.querySelector('[data-otp] input')?.focus(), 50);
    } catch (err) {
      setError(err.message);
      if (err.status === 429 && err.payload?.retry_after) {
        setResendIn(Math.min(err.payload.retry_after, 900));
      }
    } finally { setBusy(false); }
  }

  async function handleVerify(e) {
    e?.preventDefault();
    setError('');
    if (code.length !== 6) { setError('أدخل كوداً كاملاً من 6 أرقام'); return; }
    setBusy(true);
    try {
      await verifyCode({ phone: phone.trim(), code });
      const admin = await onLoggedIn();
      if (admin) navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* ترويسة */}
        <div dir="rtl" className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-block bg-sunbeam px-3 py-1.5 font-mono text-xs font-black tracking-[0.3em] text-sunbeam-ink border-2 border-ink-deep shadow-brutal-sm uppercase">
            OM/ADMIN
          </div>
          <h1 className="text-2xl font-black text-slate-100">الدخول للمدراء فقط</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            المصادقة تتم عبر <span className="font-bold text-electric-soft">واتسابك الشخصي</span> — لا كلمة مرور ولا حفظ لأي بيانات حساسة في المتصفح.
          </p>
        </div>

        <BrutalCard className="p-6 shadow-brutal">
          {step === 'phone' ? (
            <form onSubmit={handleRequestCode}>
              <BrutalLabel htmlFor="phone">رقم واتساب المدير — بصيغة دولية</BrutalLabel>
              <div dir="ltr" className="flex items-stretch gap-2">
                <span className="flex items-center border-2 border-slate-700 bg-slate-950 px-3 font-mono text-slate-500">+</span>
                <BrutalInput
                  id="phone"
                  ref={phoneRef}
                  dir="ltr"
                  inputMode="tel"
                  placeholder="201000000002"
                  value={phone.replace(/^\+/, '')}
                  onChange={(e) => setPhone(`+${e.target.value.replace(/[^\d]/g, '')}`)}
                  className="font-mono tracking-widest"
                />
              </div>
              <p className="mt-2 font-mono text-[10px] leading-5 tracking-wider text-slate-600">
                سيُرسَل كود تحقق لمرة واحدة (OTP) صالح 5 دقائق إلى هذا الرقم.
              </p>

              {error && <div className="mt-4"><Notice kind="error">{error}</Notice></div>}

              <PrimaryCta type="submit" disabled={busy || phone.length < 12} className="mt-5 w-full">
                {busy ? '…جارٍ الإرسال' : 'إرسال كود الواتساب'}
              </PrimaryCta>
            </form>
          ) : (
            <form onSubmit={handleVerify} data-otp>
              <div className="mb-4 flex items-center justify-between">
                <BrutalLabel>أدخل الكود المُرسل إلى</BrutalLabel>
                <span dir="ltr" className="font-mono text-xs font-bold text-electric-soft">{phone}</span>
              </div>

              <OtpBoxes value={code} onChange={setCode} disabled={busy} />

              {dev && (
                <div className="mt-4" dir="rtl">
                  <Notice kind="info">
                    <span className="font-mono text-[10px] tracking-[0.3em] block mb-1 uppercase">وضع التطوير — مزوّد واتساب غير مفعّل</span>
                    الكود: <b dir="ltr" className="font-mono text-base tracking-[0.3em]">{dev.code}</b>
                    {dev.url && (
                      <>
                        {' '}· الرابط السحري:{' '}
                        <button type="button" onClick={() => setMagic({ t: dev.url.split('t=')[1]?.split('&')[0], p: phone })}
                          className="underline decoration-electric">جرّبه</button>
                      </>
                    )}
                  </Notice>
                </div>
              )}

              {info && !error && !dev && <div className="mt-4"><Notice kind="success">{info}</Notice></div>}
              {error && <div className="mt-4"><Notice kind="error">{error}</Notice></div>}

              <PrimaryCta type="submit" disabled={busy || code.length !== 6} className="mt-5 w-full">
                {busy ? '…جارٍ التحقق' : 'تأكيد الدخول'}
              </PrimaryCta>

              <div className="mt-4 flex items-center justify-between">
                <ActionButton type="button" variant="ghost" onClick={() => { setStep('phone'); setError(''); setInfo(''); setDev(null); }}>
                  تغيير الرقم
                </ActionButton>
                <ActionButton type="button" variant="blue" disabled={resendIn > 0 || busy} onClick={handleRequestCode}>
                  {resendIn > 0 ? `إعادة الإرسال بعد ${resendIn}ث` : 'إعادة إرسال الكود'}
                </ActionButton>
              </div>
            </form>
          )}
        </BrutalCard>

        <p className="mt-6 text-center font-mono text-[10px] leading-5 tracking-[0.25em] text-slate-600 uppercase">
          Protected by WhatsApp OTP · Cloudflare Workers · D1 Sessions
        </p>
      </div>
    </div>
  );
}
