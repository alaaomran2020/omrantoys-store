import React from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, File, FileCode, Printer, Table, Globe, HeartPulse, Search, BarChart3 } from 'lucide-react';
import { SectionHeader, Card, CardHeader, Button, Badge } from '../ui';
import { exportProducts, exportSiteData, toMarkdown, downloadBlob, toCSV, toJSON, toHTML, toTXT, printReport } from '../../../lib/exporters';
import { getEventStats } from '../../../lib/analytics';
import { computeHealth, buildAlerts, getSeoChecks } from '../../../lib/adminUtils';
import { getSettings } from '../../../lib/settings';

const FORMATS = [
  { id: 'csv', label: 'CSV', desc: 'Excel / Sheets', icon: FileSpreadsheet, cls: 'text-emerald-600 bg-emerald-50' },
  { id: 'json', label: 'JSON', desc: 'بيانات خام', icon: FileJson, cls: 'text-amber-600 bg-amber-50' },
  { id: 'xlsx', label: 'XLSX', desc: 'Excel (HTML-Excel)', icon: Table, cls: 'text-blue-600 bg-blue-50' },
  { id: 'pdf', label: 'PDF', desc: 'طباعة / مشاركة', icon: Printer, cls: 'text-rose-600 bg-rose-50' },
  { id: 'html', label: 'HTML', desc: 'متصفح', icon: FileCode, cls: 'text-purple-600 bg-purple-50' },
  { id: 'md', label: 'Markdown', desc: 'توثيق', icon: FileText, cls: 'text-slate-600 bg-slate-100' },
  { id: 'txt', label: 'TXT', desc: 'نص', icon: File, cls: 'text-slate-600 bg-slate-100' },
];

const REPORTS = [
  { id: 'products', label: 'تقرير المنتجات', desc: 'كل بيانات المنتجات', icon: Table },
  { id: 'website', label: 'تقرير الموقع', desc: 'حالة الموقع + المنتجات + SEO + صحة', icon: Globe },
  { id: 'seo', label: 'تقرير SEO', desc: 'فحوصات SEO والتوصيات', icon: Search },
  { id: 'analytics', label: 'تقرير التحليلات', desc: 'الأحداث والإحصائيات', icon: BarChart3 },
  { id: 'health', label: 'تقرير صحة الموقع', desc: 'المشاكل والحالات', icon: HeartPulse },
];

export default function Export({ ctx }) {
  const { products, notify } = ctx;
  const settings = getSettings();
  const events = getEventStats(9999);
  const health = computeHealth(products);
  const alerts = buildAlerts(products);

  const doExport = (format) => {
    exportProducts(products, format);
    notify(`تم تصدير المنتجات بصيغة ${format.toUpperCase()}`);
  };

  const buildReportSections = (id) => {
    const date = new Date().toISOString().slice(0, 10);
    if (id === 'products') {
      return [{ title: 'تقرير المنتجات', table: products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, category: p.category, price: p.price ?? p.retail_price, stock: p.stock, brand: p.brand, visible: p.is_visible === false ? 'hidden' : 'active' })) }];
    }
    if (id === 'health') {
      return [{ title: 'تقرير صحة الموقع', lines: [`التاريخ: ${date}`, `صحة الموقع: ${health.total} / 100`, ''] }, { title: 'المشاكل', lines: alerts.map((a) => `${a.severity}: ${a.title} — ${a.detail}`) }];
    }
    if (id === 'seo') {
      return [{ title: 'تقرير SEO', lines: getSeoChecks(products, settings).map((c) => `${c.status === 'ok' ? '✓' : '✗'} ${c.title}: ${c.detail} — توصية: ${c.recommendation}`) }];
    }
    if (id === 'analytics') {
      return [{ title: 'تقرير التحليلات', lines: [`إجمالي الأحداث: ${events.total}`, ...Object.entries(events.byType).map(([k, v]) => `${k}: ${v}`)] }];
    }
    return [
      { title: 'تقرير الموقع الشامل', lines: [`التاريخ: ${date}`, `اسم المتجر: ${settings.general.siteName}`, `صحة الموقع: ${health.total} / 100`, `المنتجات: ${products.length}`, `الأحداث المسجلة: ${events.total}`, `GA4: ${settings.analytics.ga4Id || 'غير مضبوط'}`, `WhatsApp: ${settings.whatsapp.phone}`] },
      { title: 'المنتجات', table: products.map((p) => ({ name: p.name, sku: p.sku, price: p.price ?? p.retail_price, stock: p.stock })) },
      { title: 'المشاكل', lines: alerts.map((a) => `${a.title}`) },
    ];
  };

  const doReport = (id, format) => {
    const sections = buildReportSections(id);
    const date = new Date().toISOString().slice(0, 10);
    const base = `report-${id}-${date}`;
    const title = `OMRAN TOYS — ${REPORTS.find((r) => r.id === id)?.label || id}`;
    const primaryTable = sections.find((s) => s.table)?.table || [];
    if (format === 'json') { downloadBlob(toJSON(sections), `${base}.json`, 'application/json'); }
    else if (format === 'md') { downloadBlob(toMarkdown(sections), `${base}.md`, 'text/markdown;charset=utf-8'); }
    else if (format === 'html') { downloadBlob(toHTML(title, sections), `${base}.html`, 'text/html;charset=utf-8'); }
    else if (format === 'txt') { downloadBlob(toTXT(sections), `${base}.txt`, 'text/plain;charset=utf-8'); }
    else if (format === 'csv') { downloadBlob(toCSV(primaryTable), `${base}.csv`, 'text/csv;charset=utf-8'); }
    else if (format === 'pdf') { printReport(title, sections); }
    notify(`تم تصدير تقرير ${id} بصيغة ${format.toUpperCase()}`);
  };

  return (
    <div>
      <SectionHeader title="مركز التصدير والتقارير" subtitle="استخرج بيانات موقعك بأكثر من صيغة" icon={Download} />

      {/* Full export */}
      <Card className="mb-4">
        <CardHeader title="تصدير شامل للموقع (Full Export)" icon={Download} />
        <div className="p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">يصدّر كل المنتجات + الإعدادات + الأحداث + الإحصائيات في ملف JSON واحد.</p>
          <Button onClick={() => { exportSiteData(products, settings, events.events); notify('تم تصدير النسخة الكاملة'); }}>تصدير شامل (JSON)</Button>
        </div>
      </Card>

      {/* Report types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {REPORTS.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-slate-100 text-toy-red"><r.icon className="w-5 h-5" /></span>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800">{r.label}</p>
                <p className="text-[11px] text-slate-400">{r.desc}</p>
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {['json', 'md', 'html', 'txt', 'csv', 'pdf'].map((f) => (
                    <button key={f} onClick={() => doReport(r.id, f)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer uppercase">{f}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Products export formats */}
      <Card>
        <CardHeader title="تصدير المنتجات" subtitle="اختر الصيغة المناسبة" icon={Table} />
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {FORMATS.map((f) => (
            <button key={f.id} onClick={() => doExport(f.id)} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 hover:border-toy-red/40 hover:bg-slate-50 transition-colors cursor-pointer">
              <span className={`p-2.5 rounded-xl ${f.cls}`}><f.icon className="w-5 h-5" /></span>
              <span className="text-sm font-black text-slate-700 uppercase">{f.label}</span>
              <span className="text-[10px] text-slate-400">{f.desc}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
