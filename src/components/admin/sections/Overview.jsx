import React from 'react';
import {
  Package, Eye, Star, TrendingUp, AlertTriangle, Plus, Image as ImageIcon,
  MessageCircle, Search, BarChart3, Download, ShieldCheck, RefreshCw, Palette,
} from 'lucide-react';
import { StatCard, Card, CardHeader, HealthRing, NextStep, Button } from '../ui';
import { computeProductStats, computeHealth, buildAlerts, getNextStep } from '../../../lib/adminUtils';
import { getEventStats, getTopViewedProducts, getTopCategories, EVENTS } from '../../../lib/analytics';
import { categories } from '../../../data/categories';

export default function Overview({ ctx }) {
  const { products, orders, navigate } = ctx;
  const stats = computeProductStats(products);
  const health = computeHealth(products);
  const alerts = buildAlerts(products);
  const nextStep = getNextStep(products);
  const events = getEventStats(30);
  const topViewed = getTopViewedProducts(5);
  const topCats = getTopCategories(5);
  const catName = (id) => categories.find((c) => c.id === id)?.name || id;

  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);

  const quickActions = [
    { label: 'إضافة منتج', icon: Plus, section: 'products', tone: 'bg-rose-50 text-rose-600' },
    { label: 'إدارة الصور', icon: ImageIcon, section: 'media', tone: 'bg-purple-50 text-purple-600' },
    { label: 'تعديل التصميم', icon: Palette, section: 'design', tone: 'bg-blue-50 text-blue-600' },
    { label: 'فحص صحة الموقع', icon: ShieldCheck, section: 'health', tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'التحليلات', icon: BarChart3, section: 'analytics', tone: 'bg-amber-50 text-amber-600' },
    { label: 'تصدير البيانات', icon: Download, section: 'export', tone: 'bg-cyan-50 text-cyan-600' },
    { label: 'إنشاء Backup', icon: RefreshCw, section: 'backup', tone: 'bg-slate-100 text-slate-700' },
  ];

  const lastSaved = localStorage.getItem('omran_toys_last_saved');

  return (
    <div className="space-y-5">
      <NextStep step={nextStep} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {quickActions.map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(q.section)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-slate-200 bg-white hover:border-toy-red/40 hover:shadow-sm transition-all cursor-pointer"
          >
            <span className={`p-2 rounded-xl ${q.tone}`}><q.icon className="w-4 h-4" /></span>
            <span className="text-[11px] font-bold text-slate-600">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div>
        <h3 className="text-sm font-black text-slate-900 mb-3">نظرة عامة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="إجمالي المنتجات" value={stats.total} icon={Package} tone="blue" />
          <StatCard label="المنتجات النشطة" value={stats.active} icon={Eye} tone="green" />
          <StatCard label="بدون صور" value={stats.noImage} icon={ImageIcon} tone={stats.noImage ? 'red' : 'green'} />
          <StatCard label="بدون وصف" value={stats.noDescription} icon={Star} tone={stats.noDescription ? 'amber' : 'green'} />
          <StatCard label="نفد المخزون" value={stats.outOfStock} icon={AlertTriangle} tone={stats.outOfStock ? 'red' : 'green'} />
          <StatCard label="مشاهدات المنتجات" value={stats.views || 0} icon={TrendingUp} tone="purple" sub="من الأحداث المسجلة" />
          <StatCard label="الطلبات" value={orders.length} icon={Package} tone="blue" />
          <StatCard label="إجمالي المبيعات (ج.م)" value={totalSales.toLocaleString('en-US')} icon={BarChart3} tone="amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health */}
        <Card className="p-5 lg:col-span-1">
          <CardHeader title="صحة الموقع" icon={ShieldCheck} action={
            <Button variant="outline" onClick={() => navigate('health')}>التفاصيل</Button>
          } />
          <div className="flex items-center gap-4 mt-4">
            <HealthRing score={health.total} />
            <div className="flex-1 space-y-2">
              {Object.entries(health.scores).slice(0, 5).map(([key, v]) => (
                <div key={key}>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-0.5">
                    <span>{areaLabel(key)}</span>
                    <span>{v === null ? 'غير متاح' : v}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    {v !== null && (
                      <div className={`h-full rounded-full ${v >= 80 ? 'bg-emerald-500' : v >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${v}%` }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            {health.total === null ? 'لا توجد بيانات كافية لقياس صحة الموقع.' : `يُحسب من البيانات الفعلية المتاحة.`}
          </div>
        </Card>

        {/* Most viewed */}
        <Card className="lg:col-span-1">
          <CardHeader title="الأكثر مشاهدة" icon={Eye} />
          <div className="p-4 space-y-2">
            {topViewed.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">لا توجد بيانات كافية بعد</p>
            )}
            {topViewed.map((t, i) => {
              const p = products.find((x) => String(x.id) === String(t.productId));
              return (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-300 font-black w-4">{i + 1}</span>
                    {p?.images?.[0] ? <img src={p.images[0]} alt="" className="w-7 h-7 rounded-lg object-cover" /> : <div className="w-7 h-7 rounded-lg bg-slate-100" />}
                    <span className="font-bold text-slate-700 truncate">{p?.name || '—'}</span>
                  </div>
                  <span className="font-black text-slate-400">{t.count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top categories + activity */}
        <Card className="lg:col-span-1">
          <CardHeader title="نشاط الزوار" icon={Search} />
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-toy-red">{events.byType[EVENTS.productView] || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold">فتح منتج</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-emerald-600">{events.byType[EVENTS.whatsappClick] || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold">نقرات WhatsApp</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-blue-600">{events.byType[EVENTS.productSearch] || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold">عمليات بحث</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-purple-600">{events.byType[EVENTS.addToCart] || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold">إضافة للسلة</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-500 mb-1.5">أكثر التصنيفات مشاهدة</p>
              {topCats.length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد بيانات كافية بعد</p>
              ) : topCats.map((c) => (
                <div key={c.category} className="flex justify-between text-xs py-0.5">
                  <span className="text-slate-600">{catName(c.category)}</span>
                  <span className="font-bold text-slate-400">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts preview */}
      <Card>
        <CardHeader title="التنبيهات" icon={AlertTriangle} action={
          <Button variant="outline" onClick={() => navigate('alerts')}>عرض الكل ({alerts.length})</Button>
        } />
        <div className="p-4 space-y-2">
          {alerts.length === 0 ? (
            <p className="text-xs text-emerald-600 font-bold text-center py-4">لا توجد مشاكل حالياً 🎉</p>
          ) : (
            alerts.slice(0, 4).map((a) => (
              <div key={a.id} className={`flex items-center gap-2.5 text-xs p-2.5 rounded-xl ${a.severity === 'critical' ? 'bg-rose-50 text-rose-700' : a.severity === 'high' ? 'bg-amber-50 text-amber-700' : a.severity === 'medium' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold flex-1">{a.title}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Status footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <div><p className="text-[10px] text-slate-400 font-bold">حالة الموقع</p><p className="font-black text-slate-700">يعمل بشكل طبيعي</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-500" />
          <div><p className="text-[10px] text-slate-400 font-bold">آخر حفظ</p><p className="font-black text-slate-700">{lastSaved ? new Date(lastSaved).toLocaleString('ar-EG') : 'لم يُحفظ بعد'}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-purple-500" />
          <div><p className="text-[10px] text-slate-400 font-bold">آخر نشر</p><p className="font-black text-slate-700">{lastSaved ? new Date(lastSaved).toLocaleString('ar-EG') : 'غير متاح'}</p></div>
        </div>
      </div>
    </div>
  );
}

const areaLabel = (k) => ({ content: 'المحتوى', images: 'الصور', seo: 'SEO', technical: 'تقني', analytics: 'التحليلات', performance: 'الأداء', security: 'الأمان', accessibility: 'الإتاحة' }[k] || k);
