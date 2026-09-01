import React, { useState } from 'react';
import {
  Globe, Save, Phone, Search, RefreshCw, MessageCircle, Link2, Image as ImageIcon,
} from 'lucide-react';
import { SectionHeader, Card, CardHeader, Field, inputCls, Toggle, Button } from '../ui';
import { getSettings, saveSettings } from '../../../lib/settings';

const TABS = [
  { id: 'general', label: 'عام', icon: Globe },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'analytics', label: 'التحليلات', icon: ImageIcon },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export default function Control({ ctx }) {
  const { notify } = ctx;
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState(getSettings());
  const [saved, setSaved] = useState(false);

  const set = (section, key, value) => setSettings((s) => ({ ...s, [section]: { ...s[section], [key]: value } }));

  const save = () => {
    saveSettings(settings);
    localStorage.setItem('omran_toys_last_saved', new Date().toISOString());
    setSaved(true);
    notify('تم حفظ الإعدادات');
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    if (window.confirm('هل تريد إعادة ضبط كل الإعدادات للافتراضي؟')) {
      localStorage.removeItem('omran_toys_site_settings');
      setSettings(getSettings());
      notify('تمت إعادة الضبط');
    }
  };

  return (
    <div>
      <SectionHeader title="التحكم الكامل بالموقع" subtitle="الإعدادات العامة والتنقل وSEO والتحليلات وWhatsApp" icon={Globe}
        action={<div className="flex gap-2"><Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4" /> إعادة ضبط</Button><Button onClick={save}>{saved ? <CheckMark /> : <Save className="w-4 h-4" />} {saved ? 'تم الحفظ' : 'حفظ'}</Button></div>} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${tab === t.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tab === 'general' && (
          <>
            <Card><CardHeader title="بيانات المتجر" icon={Globe} />
              <div className="p-4 space-y-3">
                <Field label="اسم الموقع"><input className={inputCls} value={settings.general.siteName} onChange={(e) => set('general', 'siteName', e.target.value)} /></Field>
                <Field label="الوصف"><textarea rows={2} className={inputCls} value={settings.general.description} onChange={(e) => set('general', 'description', e.target.value)} /></Field>
                <Field label="البريد الإلكتروني"><input className={inputCls} dir="ltr" value={settings.general.email} onChange={(e) => set('general', 'email', e.target.value)} /></Field>
                <Field label="العنوان"><input className={inputCls} value={settings.general.address} onChange={(e) => set('general', 'address', e.target.value)} /></Field>
                <Field label="ساعات العمل"><input className={inputCls} value={settings.general.businessHours} onChange={(e) => set('general', 'businessHours', e.target.value)} /></Field>
              </div>
            </Card>
            <Card><CardHeader title="روابط التواصل الاجتماعي" icon={Link2} />
              <div className="p-4 space-y-3">
                <Field label="فيسبوك"><input className={inputCls} dir="ltr" value={settings.social.facebook} onChange={(e) => set('social', 'facebook', e.target.value)} placeholder="https://facebook.com/..." /></Field>
                <Field label="انستغرام"><input className={inputCls} dir="ltr" value={settings.social.instagram} onChange={(e) => set('social', 'instagram', e.target.value)} /></Field>
                <Field label="تيك توك"><input className={inputCls} dir="ltr" value={settings.social.tiktok} onChange={(e) => set('social', 'tiktok', e.target.value)} /></Field>
                <Field label="تويتر/X"><input className={inputCls} dir="ltr" value={settings.social.twitter} onChange={(e) => set('social', 'twitter', e.target.value)} /></Field>
              </div>
            </Card>
          </>
        )}

        {tab === 'seo' && (
          <Card className="lg:col-span-2"><CardHeader title="إعدادات SEO العالمية" icon={Search} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="عنوان الموقع العالمي" className="sm:col-span-2"><input className={inputCls} value={settings.seo.globalTitle} onChange={(e) => set('seo', 'globalTitle', e.target.value)} /></Field>
              <Field label="الوصف التعريفي (Meta Description)" className="sm:col-span-2"><textarea rows={2} className={inputCls} value={settings.seo.metaDescription} onChange={(e) => set('seo', 'metaDescription', e.target.value)} /></Field>
              <Field label="الكلمات المفتاحية" className="sm:col-span-2"><input className={inputCls} value={settings.seo.globalKeywords} onChange={(e) => set('seo', 'globalKeywords', e.target.value)} /></Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">Canonical</span><Toggle checked={settings.seo.canonicalEnabled !== false} onChange={(v) => set('seo', 'canonicalEnabled', v)} /></div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">Robots / الفهرسة</span><Toggle checked={settings.seo.robotsEnabled !== false} onChange={(v) => set('seo', 'robotsEnabled', v)} /></div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">Open Graph</span><Toggle checked={settings.seo.openGraphEnabled !== false} onChange={(v) => set('seo', 'openGraphEnabled', v)} /></div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">Twitter Card</span><Toggle checked={settings.seo.twitterEnabled} onChange={(v) => set('seo', 'twitterEnabled', v)} /></div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">بيانات منظمة (Structured Data)</span><Toggle checked={settings.seo.structuredDataEnabled !== false} onChange={(v) => set('seo', 'structuredDataEnabled', v)} /></div>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-[11px] text-blue-700 leading-5">
                <p className="font-black mb-1">حالة Sitemap & Robots</p>
                <p>الموقع يُقدَّم كصفحة واحدة (SPA) على Cloudflare. لتفعيل Sitemap كامل أضف ملف <b dir="ltr">public/sitemap.xml</b> و <b dir="ltr">public/robots.txt</b> ثم انشره.</p>
              </div>
            </div>
          </Card>
        )}

        {tab === 'analytics' && (
          <Card className="lg:col-span-2"><CardHeader title="إعدادات Analytics والتتبع" icon={ImageIcon} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Google Analytics ID (GA4)" hint="مثال: G-XXXXXXXXXX"><input className={inputCls} dir="ltr" value={settings.analytics.ga4Id} onChange={(e) => set('analytics', 'ga4Id', e.target.value)} placeholder="G-XXXXXXXXXX" /></Field>
              <Field label="Search Console Verification"><input className={inputCls} dir="ltr" value={settings.analytics.searchConsoleVerification} onChange={(e) => set('analytics', 'searchConsoleVerification', e.target.value)} /></Field>
              <div className="sm:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div><span className="text-xs font-bold text-slate-700 block">تسجيل أحداث التتبع داخل المتصفح</span><span className="text-[10px] text-slate-400">فتح منتج، بحث، نقرات WhatsApp، إضافة للسلة</span></div>
                <Toggle checked={settings.analytics.eventTracking !== false} onChange={(v) => set('analytics', 'eventTracking', v)} />
              </div>
            </div>
          </Card>
        )}

        {tab === 'whatsapp' && (
          <Card className="lg:col-span-2"><CardHeader title="إعدادات WhatsApp" icon={Phone} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="رقم الواتساب (بصيغة دولية)" hint="بدون +"><input className={inputCls} dir="ltr" value={settings.whatsapp.phone} onChange={(e) => set('whatsapp', 'phone', e.target.value)} /></Field>
              <Field label="الرسالة الافتراضية"><input className={inputCls} value={settings.whatsapp.defaultMessage} onChange={(e) => set('whatsapp', 'defaultMessage', e.target.value)} /></Field>
              <Field label="قالب رسالة المنتج" className="sm:col-span-2" hint="استخدم {product} و {price}"><textarea rows={2} className={inputCls} value={settings.whatsapp.productTemplate} onChange={(e) => set('whatsapp', 'productTemplate', e.target.value)} /></Field>
              <div className="sm:col-span-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] text-emerald-700">
                <p className="font-black mb-1 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> معاينة رابط الواتساب</p>
                <p dir="ltr" className="break-all font-mono">https://wa.me/{settings.whatsapp.phone}?text={encodeURIComponent(settings.whatsapp.defaultMessage)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function CheckMark() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
