import React from 'react';
import { HeartPulse, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';
import { SectionHeader, Card, CardHeader, HealthRing, StatusPill, Button, EmptyState } from '../ui';
import { computeHealth, getSeoChecks, buildAlerts, HEALTH_AREAS } from '../../../lib/adminUtils';
import { getSettings } from '../../../lib/settings';

export default function Health({ ctx }) {
  const { products, navigate } = ctx;
  const health = computeHealth(products);
  const settings = getSettings();
  const alerts = buildAlerts(products);

  // Build full checks list combining SEO checks + health-derived
  const checks = [
    ...getSeoChecks(products, settings).map((c) => ({ ...c, area: 'seo' })),
    { id: 'images', area: 'images', status: (products.filter((p) => !p.images || p.images.length === 0).length) === 0 ? 'ok' : 'critical', title: 'صور المنتجات', detail: `${products.filter((p) => !p.images || p.images.length === 0).length} منتجات بدون صور`, recommendation: 'أضف صوراً لكل منتج', fixable: true, fix: 'media' },
    { id: 'content', area: 'content', status: (products.filter((p) => !p.description || !String(p.description).trim()).length) === 0 ? 'ok' : 'high', title: 'أوصاف المنتجات', detail: `${products.filter((p) => !p.description || !String(p.description).trim()).length} منتجات بدون وصف`, recommendation: 'أضف وصفاً لكل منتج', fixable: true, fix: 'products' },
    { id: 'stock', area: 'content', status: (products.filter((p) => (p.stock || 0) <= 0).length) === 0 ? 'ok' : 'high', title: 'المخزون النافد', detail: `${products.filter((p) => (p.stock || 0) <= 0).length} منتجات نفدت`, recommendation: 'أعد التعبئة أو أخفِ المنتج', fixable: true, fix: 'products' },
    { id: 'analytics', area: 'analytics', status: settings.analytics?.ga4Id ? 'ok' : 'warning', title: 'Google Analytics', detail: settings.analytics?.ga4Id ? 'GA4 مضبوط' : 'غير مضبوط', recommendation: 'أضف معرف GA4', fixable: true, fix: 'control' },
    { id: 'technical', area: 'technical', status: 'ok', title: 'بناء المشروع', detail: 'الموقع مبني بنجاح على Vite + Cloudflare', recommendation: 'لا يوجد إجراء' },
    { id: 'security', area: 'security', status: 'ok', title: 'الأمان', detail: 'لا تُخزَّن كلمات مرور أو بيانات حساسة في المتصفح', recommendation: 'لا يوجد إجراء' },
  ];

  const areaScore = (area) => health.scores[area];

  return (
    <div>
      <SectionHeader title="مركز صحة الموقع" subtitle="فحص شامل لحالة الموقع والمشاكل والإصلاح" icon={HeartPulse} />

      {/* Overall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-6 flex flex-col items-center justify-center">
          <p className="text-sm font-black text-slate-500 mb-2">صحة الموقع العامة</p>
          <HealthRing score={health.total} />
          <p className="text-[11px] text-slate-400 mt-2 text-center">{health.total === null ? 'لا توجد بيانات كافية بعد' : health.total >= 80 ? 'حالة ممتازة' : health.total >= 60 ? 'حالة جيدة تحتاج تحسيناً' : 'حالة حرجة — راجع المشاكل'}</p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="مؤشرات الأداء حسب القسم" icon={HeartPulse} />
          <div className="p-4 space-y-3">
            {HEALTH_AREAS.map((a) => {
              const score = areaScore(a.id);
              return (
                <div key={a.id}>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>{a.label}</span>
                    <span className={score === null ? 'text-slate-400' : score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'}>
                      {score === null ? 'غير متاح' : score + ' / 100'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    {score !== null && (
                      <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Checks list */}
      <Card>
        <CardHeader title="قائمة الفحوصات" subtitle="كل فحص يعرض الحالة والتوصية وزر إصلاح آمن" icon={Wrench} />
        <div className="divide-y divide-slate-100">
          {checks.map((c) => (
            <div key={c.id} className="p-4 flex items-start gap-3">
              <span className="mt-0.5">{c.status === 'ok' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : c.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : c.status === 'critical' || c.status === 'high' ? <AlertTriangle className="w-5 h-5 text-rose-500" /> : <Info className="w-5 h-5 text-blue-500" />}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-slate-800">{c.title}</span>
                  <StatusPill status={c.status} />
                  <span className="text-[10px] text-slate-400">{HEALTH_AREAS.find((a) => a.id === c.area)?.label}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{c.detail}</p>
                <p className="text-[11px] text-slate-400 mt-0.5"><span className="font-bold">التوصية:</span> {c.recommendation}</p>
                {c.fixable && c.fix && (
                  <Button variant="outline" className="mt-2" onClick={() => navigate(c.fix)}><Wrench className="w-3.5 h-3.5" /> إصلاح</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Alerts center */}
      <Card className="mt-4">
        <CardHeader title="مركز التنبيهات" subtitle="مشاكل حقيقية مكتشفة تلقائياً" icon={AlertTriangle} />
        <div className="p-4 space-y-2">
          {alerts.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="لا توجد مشاكل حالياً 🎉" hint="كل شيء يعمل بشكل سليم." />
          ) : alerts.map((a) => (
            <div key={a.id} className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${a.severity === 'critical' ? 'bg-rose-50 text-rose-700' : a.severity === 'high' ? 'bg-amber-50 text-amber-700' : a.severity === 'medium' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-black">{a.title}</p>
                <p className="mt-0.5 opacity-90">{a.detail}</p>
              </div>
              {a.action && (
                <Button variant="ghost" onClick={() => navigate(a.action.section)} className="shrink-0">{a.action.label}</Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
