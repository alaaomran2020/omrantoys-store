import React, { useState } from 'react';
import { BarChart3, TrendingUp, Eye, MessageCircle, Search, ShoppingCart, Activity } from 'lucide-react';
import { SectionHeader, Card, CardHeader, EmptyState, Badge } from '../ui';
import { getEventStats, getTopViewedProducts, getTopCategories, EVENTS } from '../../../lib/analytics';
import { categories } from '../../../data/categories';

const RANGES = [
  { days: 7, label: '7 أيام' },
  { days: 30, label: '30 يوم' },
  { days: 90, label: '90 يوم' },
  { days: 365, label: 'كل الفترة' },
];

export default function Analytics({ ctx }) {
  const { products } = ctx;
  const [days, setDays] = useState(30);
  const stats = getEventStats(days === 365 ? 9999 : days);
  const topViewed = getTopViewedProducts(6);
  const topCats = getTopCategories(6);
  const catName = (id) => categories.find((c) => c.id === id)?.name || id;

  const eventLabels = {
    [EVENTS.productView]: { label: 'فتح منتج', icon: Eye, color: '#FF4D6D' },
    [EVENTS.productSearch]: { label: 'بحث', icon: Search, color: '#16A6B6' },
    [EVENTS.whatsappClick]: { label: 'نقرات WhatsApp', icon: MessageCircle, color: '#10b981' },
    [EVENTS.addToCart]: { label: 'إضافة للسلة', icon: ShoppingCart, color: '#8338EC' },
    [EVENTS.orderPlaced]: { label: 'طلبات', icon: Activity, color: '#f59e0b' },
  };

  const maxDaily = Math.max(1, ...stats.daily.map((d) => d.count));
  const hasData = stats.total > 0;

  return (
    <div>
      <SectionHeader title="تحليلات الموقع" subtitle="أحداث حقيقية مسجلة داخل المتصفح" icon={BarChart3}
        action={
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <button key={r.days} onClick={() => setDays(r.days)} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${days === r.days ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{r.label}</button>
            ))}
          </div>
        } />

      {!hasData ? (
        <Card><EmptyState icon={BarChart3} title="لا توجد بيانات كافية بعد" hint="ستبدأ البيانات بالتجمّع من لحظة تفعيل التتبع (فتح منتج، بحث، نقرات WhatsApp...)." /></Card>
      ) : (
        <div className="space-y-4">
          {/* Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(eventLabels).map(([type, m]) => {
              const Icon = m.icon;
              return (
                <Card key={type} className="p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl" style={{ background: m.color + '1a', color: m.color }}><Icon className="w-4 h-4" /></span>
                    <div>
                      <p className="text-lg font-black text-slate-900">{stats.byType[type] || 0}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{m.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Daily chart */}
          <Card>
            <CardHeader title={`النشاط اليومي (آخر ${days === 9999 ? 'فترة' : days} يوم)`} icon={TrendingUp} />
            <div className="p-4">
              <div className="flex items-end gap-[3px] h-40">
                {stats.daily.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full rounded-t bg-gradient-to-t from-rose-500 to-pink-400 transition-all group-hover:from-rose-600 group-hover:to-pink-500" style={{ height: `${Math.max(4, (d.count / maxDaily) * 100)}%` }} title={`${d.label}: ${d.count}`} />
                    {(stats.daily.length <= 12 || i % Math.ceil(stats.daily.length / 8) === 0) && (
                      <span className="text-[8px] text-slate-400 font-mono">{d.label.slice(5)}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-bold">
                <span>{stats.daily[0]?.label}</span>
                <span>إجمالي: {stats.total} حدث</span>
                <span>{stats.daily[stats.daily.length - 1]?.label}</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top products */}
            <Card>
              <CardHeader title="أكثر المنتجات مشاهدة" icon={Eye} />
              <div className="p-4 space-y-2">
                {topViewed.length === 0 && <p className="text-xs text-slate-400 text-center py-6">لا توجد بيانات</p>}
                {topViewed.map((t, i) => {
                  const p = products.find((x) => String(x.id) === String(t.productId));
                  const max = topViewed[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-300 font-black w-4">{i + 1}</span>
                      {p?.images?.[0] && <img src={p.images[0]} alt="" className="w-7 h-7 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-700 truncate">{p?.name || '—'}</span>
                          <span className="font-black text-slate-400">{t.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-toy-red rounded-full" style={{ width: `${(t.count / max) * 100}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Top categories */}
            <Card>
              <CardHeader title="أكثر التصنيفات مشاهدة" icon={BarChart3} />
              <div className="p-4 space-y-2">
                {topCats.length === 0 && <p className="text-xs text-slate-400 text-center py-6">لا توجد بيانات</p>}
                {topCats.map((c, i) => {
                  const max = topCats[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-300 font-black w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-700">{catName(c.category)}</span>
                          <span className="font-black text-slate-400">{c.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(c.count / max) * 100}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent events */}
          <Card>
            <CardHeader title="أحدث الأحداث" icon={Activity} />
            <div className="p-4">
              {stats.events.slice().reverse().slice(0, 20).length === 0 ? <p className="text-xs text-slate-400">لا توجد أحداث</p> : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {stats.events.slice().reverse().slice(0, 40).map((e, i) => {
                    const m = eventLabels[e.type];
                    const Icon = m ? m.icon : Activity;
                    const name = e.data?.productId ? products.find((p) => String(p.id) === String(e.data.productId))?.name : null;
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-xs p-2 rounded-lg hover:bg-slate-50">
                        {m && <span style={{ color: m.color }}><Icon className="w-3.5 h-3.5" /></span>}
                        <span className="font-bold text-slate-700 flex-1">{m ? m.label : e.type}{name && <span className="text-slate-400 font-normal"> — {name}</span>}</span>
                        <Badge tone="slate">{new Date(e.ts).toLocaleString('ar-EG')}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
