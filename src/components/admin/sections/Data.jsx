import React, { useState } from 'react';
import { Database, Package, LayoutGrid, Image as ImageIcon, Search, BarChart3, Settings as SettingsIcon, Activity, HeartPulse, Copy } from 'lucide-react';
import { SectionHeader, Card, CardHeader } from '../ui';
import { computeProductStats, computeHealth } from '../../../lib/adminUtils';
import { getEventStats } from '../../../lib/analytics';
import { getSettings } from '../../../lib/settings';
import { categories } from '../../../data/categories';

const SECTIONS = [
  { id: 'products', label: 'بيانات المنتجات', icon: Package },
  { id: 'categories', label: 'بيانات التصنيفات', icon: LayoutGrid },
  { id: 'images', label: 'بيانات الصور', icon: ImageIcon },
  { id: 'seo', label: 'بيانات SEO', icon: Search },
  { id: 'analytics', label: 'بيانات التحليلات', icon: BarChart3 },
  { id: 'events', label: 'بيانات الأحداث', icon: Activity },
  { id: 'settings', label: 'بيانات الإعدادات', icon: SettingsIcon },
  { id: 'health', label: 'بيانات الصحة', icon: HeartPulse },
];

export default function Data({ ctx }) {
  const { products } = ctx;
  const [open, setOpen] = useState('products');
  const stats = computeProductStats(products);
  const health = computeHealth(products);
  const events = getEventStats(9999);
  const settings = getSettings();
  const [copied, setCopied] = useState('');

  const copy = (key, value) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const rows = SECTIONS.find((s) => s.id === open);
  const dataBySection = {
    products: {
      total: stats.total, active: stats.active, hidden: stats.hidden, outOfStock: stats.outOfStock,
      lowStock: stats.lowStock, noImage: stats.noImage, noDescription: stats.noDescription, views: stats.views,
    },
    categories: categories.map((c) => ({ id: c.id, name: c.name, count: products.filter((p) => p.category === c.id).length })),
    images: { totalImages: products.reduce((s, p) => s + (p.images?.length || 0), 0), productsWithoutImage: stats.noImage, productsWithoutAlt: products.filter((p) => p.images?.length && !p.altText).length },
    seo: settings.seo,
    analytics: { ga4Id: settings.analytics?.ga4Id || 'غير مضبوط', eventTracking: settings.analytics?.eventTracking, totalEvents: events.total },
    events: { total: events.total, byType: events.byType },
    settings,
    health: { total: health.total, scores: health.scores },
  };

  return (
    <div>
      <SectionHeader title="مركز بيانات الموقع" subtitle="كل بيانات الموقع في مكان واحد" icon={Database} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5 lg:sticky lg:top-4 h-fit">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setOpen(s.id)} className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${open === s.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader title={rows.label} icon={rows.icon} action={
              <button onClick={() => copy(open, dataBySection[open])} className="text-[11px] font-bold text-toy-red hover:underline cursor-pointer flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> {copied === open ? 'تم النسخ' : 'نسخ كبيانات'}</button>
            } />
            <div className="p-4">
              {/* Simple tables/JSON view */}
              {Array.isArray(dataBySection[open]) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 text-slate-500 font-bold"><tr>{(Object.keys(dataBySection[open][0] || {})).map((h) => <th key={h} className="p-2.5">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">{dataBySection[open].map((r, i) => <tr key={i} className="hover:bg-slate-50">{(Object.keys(dataBySection[open][0] || {})).map((h) => <td key={h} className="p-2.5">{r[h] ?? '—'}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-[11px] bg-slate-900 text-emerald-300 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto" dir="ltr">
                  {JSON.stringify(dataBySection[open], null, 2).split('\n').map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
