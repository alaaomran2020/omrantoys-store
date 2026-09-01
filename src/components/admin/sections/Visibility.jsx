import React from 'react';
import { Search, Bot, Sparkles, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SectionHeader, Card, CardHeader, StatusPill, NextStep } from '../ui';
import { getSeoChecks, computeHealth } from '../../../lib/adminUtils';
import { getSettings } from '../../../lib/settings';

export default function Visibility({ ctx }) {
  const { products, navigate } = ctx;
  const settings = getSettings();
  const checks = getSeoChecks(products, settings);
  const health = computeHealth(products);
  const okCount = checks.filter((c) => c.status === 'ok').length;
  const score = health.scores.seo;

  const missingDesc = products.filter((p) => !p.description || !String(p.description).trim()).length;

  const nextStep = (() => {
    if (missingDesc > 0) return { title: `أضف وصفاً مختصراً لـ ${missingDesc} منتجات (80–150 كلمة)`, detail: 'الوصف يحسّن ظهور المنتج في محركات البحث وأدوات الذكاء الاصطناعي.', priority: 'high', action: { label: 'المنتجات', section: 'products' } };
    if (!settings.analytics?.ga4Id) return { title: 'أضف معرف Google Analytics (GA4)', detail: 'بدون تتبع لا يمكن قياس أداء الموقع.', priority: 'medium', action: { label: 'التحكم بالموقع', section: 'control' } };
    if (products.filter((p) => p.images?.length && !p.altText).length > 0) return { title: 'أضف Alt text لصور المنتجات', detail: 'يحسّن SEO والصور في نتائج البحث.', priority: 'medium', action: { label: 'الوسائط', section: 'media' } };
    return { title: 'SEO في حالة جيدة 🎉', detail: 'أكمل ببناء Sitemap وروابط داخلية.', priority: 'low' };
  })();

  const readiness = (title, Icon, scoreVal, checksArr, color) => (
    <Card>
      <CardHeader title={title} icon={icon} />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black" style={{ background: color + '1a', color }}>{scoreVal === null ? '—' : scoreVal}</div>
          <div>
            <p className="text-xs text-slate-400 font-bold">{scoreVal === null ? 'غير متاح' : scoreVal >= 80 ? 'جاهز' : scoreVal >= 60 ? 'جيد' : 'يحتاج تحسيناً'}</p>
            <p className="text-[11px] text-slate-500">مقياس تقريبي من الفحوصات المتاحة</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {checksArr.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {c.status === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
              <span className="text-slate-600 flex-1">{c.title}</span>
              <StatusPill status={c.status} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const seoChecksShort = checks.slice(0, 6);

  return (
    <div>
      <SectionHeader title="Search & AI Visibility" subtitle="SEO + استعداد للذكاء الاصطناعي (AEO/GEO)" icon={Search} />

      <div className="mb-4"><NextStep step={nextStep} /></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {readiness('صحة SEO', Search, score, seoChecksShort, '#FF4D6D')}
        {readiness('الاستعداد للذكاء الاصطناعي (AEO)', Bot, null, [
          { status: settings.seo.structuredDataEnabled !== false ? 'ok' : 'warning', title: 'بيانات منظمة (Structured Data)' },
          { status: settings.general.description?.length >= 50 ? 'ok' : 'warning', title: 'وصف واضح للعلامة التجارية' },
          { status: products.filter((p) => p.description).length / Math.max(1, products.length) >= 0.8 ? 'ok' : 'warning', title: 'أوصاف منتجات كاملة' },
          { status: products.length > 0 ? 'ok' : 'warning', title: 'محتوى كافٍ' },
        ], '#10b981')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {readiness('الظهور الجغرافي (GEO)', Sparkles, null, [
          { status: settings.general.address ? 'ok' : 'warning', title: 'العنوان محدد (طنطا - الغربية)' },
          { status: settings.general.phone ? 'ok' : 'warning', title: 'رقم التواصل متاح' },
          { status: settings.social.facebook || settings.social.instagram ? 'ok' : 'warning', title: 'روابط التواصل الاجتماعي' },
          { status: settings.whatsapp.phone ? 'ok' : 'warning', title: 'نقطة اتصال WhatsApp' },
        ], '#8338EC')}

        <Card>
          <CardHeader title="قائمة الفحوصات الكاملة" icon={Search} />
          <div className="p-4 space-y-2">
            {checks.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
                {c.status === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="text-xs font-black text-slate-700">{c.title}</span><StatusPill status={c.status} /></div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.detail}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5"><span className="font-bold">توصية:</span> {c.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-4">
        <div className="flex items-center gap-2 text-sm font-black text-slate-800 mb-2"><Lightbulb className="w-4 h-4 text-amber-500" /> نصائح سريعة</div>
        <ul className="space-y-1.5 text-xs text-slate-600">
          <li>• اجعل كل وصف منتج بين 80–150 كلمة ليقرأه جوجل وأدوات الذكاء الاصطناعي بوضوح.</li>
          <li>• أضف {products.filter((p) => p.images?.length && !p.altText).length} Alt text للصور (راجع قسم الوسائط).</li>
          <li>• لتفعيل Sitemap: أضف <b dir="ltr">public/sitemap.xml</b> و <b dir="ltr">public/robots.txt</b> وانشر.</li>
          <li>• حافظ على الفهرسة مفعّلة (Robots) حتى يظهر الموقع في جوجل.</li>
        </ul>
      </div>
    </div>
  );
}
