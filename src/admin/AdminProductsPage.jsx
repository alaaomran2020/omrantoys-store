/**
 * src/admin/AdminProductsPage.jsx — قائمة المنتجات للوحة الإدارة.
 * القراءة مسموحة لأي مدير؛ التعديل من صفحة التحرير؛ الحذف مقفول
 * بصرياً للدور المحدود — والخادم يرفضه أيضاً (403) إن جُرِّب.
 */
import React, { useEffect, useState } from 'react';
import { fetchAdminProducts, formatEGP, can } from '../lib/adminAuth';
import { useAdminSession } from './AdminApp';
import { SectionTitle, BrutalInput, ActionButton, LockBadge, Notice } from './ui';

const PER_PAGE = 12;

export default function AdminProductsPage({ navigate }) {
  const { session } = useAdminSession();
  const admin = session?.admin;
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canDelete = can(admin, 'products.delete');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      fetchAdminProducts({ search, limit: PER_PAGE, offset })
        .then((res) => { if (alive) { setProducts(res.products); setTotal(res.total); setError(''); } })
        .catch((err) => alive && setError(err.message))
        .finally(() => alive && setLoading(false));
    }, 250); // Debounce للبحث
    return () => { alive = false; clearTimeout(t); };
  }, [search, offset]);

  const page = Math.floor(offset / PER_PAGE) + 1;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <SectionTitle kicker="PRODUCTS / INDEX" title="المنتجات — تعديل محدود">
        <div className="flex items-center gap-2">
          {!canDelete && <LockBadge text="الحذف محجوب" />}
          <span className="font-mono text-xs text-slate-500" dir="ltr">{total} SKU</span>
        </div>
      </SectionTitle>

      {/* شريط البحث */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <BrutalInput placeholder="بحث بالاسم أو SKU…" value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-2 top-1/2 -translate-y-1/2 px-1 font-mono text-xs text-slate-500 hover:text-red-400">✕</button>
          )}
        </div>
        <span className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">PAGE {page}/{pages}</span>
      </div>

      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      {/* الجدول */}
      <div className="border-2 border-ink-deep shadow-brutal-sm">
        <table className="w-full border-collapse bg-slate-900 text-sm">
          <thead>
            <tr className="border-b-2 border-ink-deep bg-slate-950 font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">
              <th className="px-3 py-3 text-right">المنتج</th>
              <th className="px-3 py-3 text-right">SKU</th>
              <th className="px-3 py-3 text-right">السعر</th>
              <th className="px-3 py-3 text-right">المخزون</th>
              <th className="px-3 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-3 py-10 text-center font-mono text-xs tracking-widest text-slate-500 uppercase">…LOADING</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-400">لا توجد منتجات مطابقة في قاعدة D1</td></tr>
            )}
            {!loading && products.map((p) => (
              <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-900/60 transition-colors">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="h-10 w-10 border-2 border-slate-700 object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center border-2 border-slate-800 font-mono text-[9px] text-slate-600">N/A</div>
                    )}
                    <div>
                      <div className="font-bold text-slate-100">{p.name_ar}</div>
                      <div className="font-mono text-[10px] text-slate-500" dir="ltr">{p.name_en || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-slate-400" dir="ltr">{p.sku}</td>
                <td className="px-3 py-3 font-bold text-electric-soft">{formatEGP(p.retail_price)}</td>
                <td className="px-3 py-3">
                  <span className={`font-mono text-xs font-bold ${Number(p.stock_quantity) > 0 ? 'text-slate-300' : 'text-red-400'}`}>
                    {p.stock_quantity ?? '—'}
                  </span>
                  <span className="mr-1 font-mono text-[9px] text-slate-600">READ-ONLY</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ActionButton variant="blue" onClick={() => navigate(`/admin/products/${encodeURIComponent(p.id)}`)}>
                      تعديل
                    </ActionButton>
                    <button
                      disabled={!canDelete}
                      title={canDelete ? 'حذف (إخفاء) المنتج' : 'محجوب: حذف المنتجات متاح للمالك فقط — والخادم يرفضه بـ 403'}
                      className={`inline-flex items-center gap-1 rounded-none border-2 px-3 py-2 text-xs font-bold transition-colors
                        ${canDelete
                          ? 'border-red-900 text-red-400 hover:border-red-500'
                          : 'cursor-not-allowed border-slate-800 text-slate-600'}`}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {canDelete ? (
                          <path d="M3 6h18M8 6V4h8v2m-9 0v14h10V6" />
                        ) : (
                          <><rect x="4" y="11" width="16" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>
                        )}
                      </svg>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ترقيم الصفحات */}
      <div className="mt-4 flex items-center justify-between">
        <ActionButton variant="ghost" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PER_PAGE))}>
          → السابق
        </ActionButton>
        <span className="font-mono text-[10px] tracking-widest text-slate-600 uppercase">
          D1 / PRODUCTS / LIMIT {PER_PAGE}
        </span>
        <ActionButton variant="ghost" disabled={offset + PER_PAGE >= total} onClick={() => setOffset(offset + PER_PAGE)}>
          التالي ←
        </ActionButton>
      </div>
    </div>
  );
}
