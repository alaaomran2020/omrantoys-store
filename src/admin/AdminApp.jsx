/**
 * src/admin/AdminApp.jsx — التطبيق الإداري المستقل (يُركَّب عبر رابط #/admin).
 *
 * "Route Protection" في الواجهة: AdminRoute يفحص الجلسة عبر GET /api/admin/auth/me
 * قبل رسم أي شاشة، ويحوّل غير المصادققين لشاشة الدخول. هذا حارس UX —
 * الحماية الحقيقية محصورة في الـ Worker (worker/admin.js) لأن أي طلب بلا
 * جلسة صالحة يُرفض بـ 401 قبل لمس قاعدة البيانات.
 *
 * التوجيه Hash-based ليتوافق مع الاستضافة كـ Static Assets على Workers
 * مع SPA fallback (لا حاجة لقواعد rewrite على الخادم):
 *   #/admin/login            شاشة الدخول عبر واتساب
 *   #/admin/products         قائمة المنتجات
 *   #/admin/products/:id     تعديل منتج (الصلاحيات المحدودة)
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchMe, logout as apiLogout } from '../lib/adminAuth';
import AdminLoginPage from './AdminLoginPage';
import AdminProductsPage from './AdminProductsPage';
import EditProductPage from './EditProductPage';

const AdminSessionContext = createContext(null);
export const useAdminSession = () => useContext(AdminSessionContext);

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/admin/login';
  const [path, query] = raw.split('?');
  return { path: path.replace(/\/+$/, '') || '/admin/login', params: new URLSearchParams(query || '') };
}

export default function AdminApp() {
  const [route, setRoute] = useState(parseHash());
  const [session, setSession] = useState(null); // { admin, checking, booted }
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // فحص الجلسة عند الإقلاع (الكوكي HttpOnly يُفحص خادمياً)
  useEffect(() => {
    let alive = true;
    fetchMe()
      .then((data) => alive && setSession({ admin: data.admin, expires_at: data.session?.expires_at }))
      .catch(() => alive && setSession(null))
      .finally(() => alive && setBooting(false));
    return () => { alive = false; };
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const data = await fetchMe();
      setSession({ admin: data.admin, expires_at: data.session?.expires_at });
      return data.admin;
    } catch {
      setSession(null);
      return null;
    }
  }, []);

  const doLogout = useCallback(async () => {
    try { await apiLogout(); } catch { /* الجلسة منتهية أصلاً */ }
    setSession(null);
    window.location.hash = '#/admin/login';
  }, []);

  const navigate = useCallback((to) => { window.location.hash = to; }, []);

  // حارس المسار: لا تُرسم أي شاشة بيانات قبل تأكيد الجلسة
  const isLoginPage = route.path === '/admin/login';
  const authenticated = !!session?.admin;

  let screen;
  if (booting) {
    screen = <BootScreen />;
  } else if (isLoginPage) {
    // شاشة الدخول تُظهر نفسها (وتعيد التوجيه إن كانت الجلسة قائمة)
    screen = <AdminLoginPage session={session} onLoggedIn={refreshSession} navigate={navigate} />;
  } else if (!authenticated) {
    screen = <DeniedScreen navigate={navigate} />;
  } else if (route.path === '/admin/products') {
    screen = <AdminProductsPage navigate={navigate} />;
  } else if (/^\/admin\/products\/[^/]+$/.test(route.path)) {
    const id = route.path.split('/').pop();
    screen = <EditProductPage id={decodeURIComponent(id)} navigate={navigate} />;
  } else {
    screen = <NotFoundScreen navigate={navigate} />;
  }

  return (
    <AdminSessionContext.Provider value={{ session, refreshSession, doLogout, navigate }}>
      <div dir="rtl" className="min-h-screen bg-slate-950 font-cairo text-slate-200 selection:bg-electric selection:text-white">
        {/* شبكة Brutalist خلفية */}
        <div className="pointer-events-none fixed inset-0 opacity-[0.35]"
          style={{ backgroundImage: 'linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
        <div className="relative">
          {!isLoginPage && authenticated && <AdminShell navigate={navigate}>{screen}</AdminShell>}
          {(isLoginPage || !authenticated) && screen}
        </div>
      </div>
    </AdminSessionContext.Provider>
  );
}

// --------------------------- الهيكل (Shell) ---------------------------

function AdminShell({ children }) {
  const { session, doLogout } = useAdminSession();
  const admin = session?.admin;
  const isLimited = admin?.role === 'limited_admin';
  return (
    <div className="min-h-screen flex flex-col">
      {/* الشريط العلوي */}
      <header className="border-b-2 border-ink-deep bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-electric px-2.5 py-1.5 font-mono text-xs font-black tracking-widest text-white border-2 border-ink-deep">
              OM/ADMIN
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-black text-slate-100">مركز تحكم متجر عمران</div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-slate-500 uppercase">WhatsApp Auth · D1 · Workers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">{admin?.full_name}</div>
              <div className="font-mono text-[10px] tracking-widest text-slate-500" dir="ltr">{admin?.phone}</div>
            </div>
            <span dir="rtl" className={`rounded-none border-2 px-2 py-1 font-mono text-[10px] font-black tracking-widest uppercase
              ${isLimited ? 'border-electric text-electric bg-electric/10' : 'border-sunbeam text-sunbeam bg-sunbeam/10'}`}>
              {isLimited ? 'صلاحيات محدودة' : 'مالك'}
            </span>
            <button onClick={doLogout}
              className="rounded-none border-2 border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-red-500 hover:text-red-400 transition-colors">
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* شريط تنقل مقصود بقوة: المنتجات فقط للدور المحدود */}
      <nav className="border-b-2 border-ink-deep bg-slate-900/60">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
          <NavLink to="#/admin/products">المنتجات</NavLink>
          <span className="mx-1 font-mono text-slate-700">|</span>
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 line-through">
            الطلبات
          </span>
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 line-through">
            الإعدادات
          </span>
          <span className="mr-auto font-mono text-[10px] tracking-widest text-slate-600 uppercase">
            الأقسام الأخرى مقفلة لدورك — الإنفاذ على الخادم
          </span>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t-2 border-ink-deep bg-slate-900 py-4 text-center font-mono text-[10px] tracking-[0.3em] text-slate-600 uppercase">
        Cloudflare Workers + D1 · Zero-Password Auth
      </footer>
    </div>
  );
}

function NavLink({ to, children }) {
  const active = (window.location.hash || '').replace(/\/+$/, '') === to;
  return (
    <a href={to} className={`border-2 px-3 py-1.5 text-xs font-black transition-colors
      ${active ? 'border-electric bg-electric text-white' : 'border-transparent text-slate-400 hover:text-electric-soft'}`}>
      {children}
    </a>
  );
}

// --------------------------- شاشات النظام ---------------------------

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse font-mono text-sm tracking-[0.4em] text-electric uppercase">OM/ADMIN — جارٍ التحقق…</div>
    </div>
  );
}

function DeniedScreen({ navigate }) {
  useEffect(() => { const t = setTimeout(() => navigate('/admin/login'), 1200); return () => clearTimeout(t); }, [navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div dir="rtl" className="max-w-md border-2 border-red-600 bg-slate-900 p-8 text-center shadow-brutal">
        <div className="font-mono text-[10px] tracking-[0.3em] text-red-400 uppercase">401 — Unauthorized</div>
        <div className="mt-3 text-lg font-black text-slate-100">الجلسة غير صالحة</div>
        <p className="mt-2 text-sm text-slate-400">يُجري النظام تحويلك إلى تسجيل الدخول عبر واتساب…</p>
      </div>
    </div>
  );
}

function NotFoundScreen({ navigate }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div dir="rtl" className="max-w-md border-2 border-ink-deep bg-slate-900 p-8 text-center shadow-brutal">
        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-500 uppercase">404</div>
        <div className="mt-3 text-lg font-black text-slate-100">هذه الشاشة غير موجودة</div>
        <button onClick={() => navigate('/admin/products')}
          className="mt-4 border-2 border-electric px-4 py-2 text-xs font-black text-electric hover:bg-electric hover:text-white transition-colors">
          العودة للمنتجات
        </button>
      </div>
    </div>
  );
}
