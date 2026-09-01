import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, UserCog, Users, Eye, ShieldCheck, Database } from 'lucide-react';
import { SectionHeader, Card, CardHeader, Field, inputCls, Toggle, Button } from '../ui';
import { getSettings, saveSettings } from '../../../lib/settings';

const TABS = [
  { id: 'general', label: 'عام', icon: SettingsIcon },
  { id: 'appearance', label: 'المظهر', icon: SettingsIcon },
  { id: 'products', label: 'المنتجات', icon: SettingsIcon },
  { id: 'seo', label: 'SEO', icon: SettingsIcon },
  { id: 'analytics', label: 'التحليلات', icon: SettingsIcon },
  { id: 'whatsapp', label: 'WhatsApp', icon: SettingsIcon },
  { id: 'security', label: 'الأمان والصلاحيات', icon: ShieldCheck },
];

export default function Settings({ ctx }) {
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

  const resetAll = () => {
    if (window.confirm('هل تريد إعادة ضبط كل الإعدادات للافتراضي؟')) {
      localStorage.removeItem('omran_toys_site_settings');
      setSettings(getSettings());
      notify('تمت إعادة الضبط');
    }
  };

  return (
    <div>
      <SectionHeader title="الإعدادات" subtitle="إعدادات منظمة ومقسمة حسب القسم" icon={SettingsIcon}
        action={<div className="flex gap-2"><Button variant="outline" onClick={resetAll}><RefreshCw className="w-4 h-4" /> إعادة ضبط</Button><Button onClick={save}>{saved ? <CheckMark /> : <Save className="w-4 h-4" />} {saved ? 'تم الحفظ' : 'حفظ'}</Button></div>} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${tab === t.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tab === 'general' && (
          <>
            <Card><CardHeader title="البيانات العامة" icon={SettingsIcon} />
              <div className="p-4 space-y-3">
                <Field label="اسم الموقع"><input className={inputCls} value={settings.general.siteName} onChange={(e) => set('general', 'siteName', e.target.value)} /></Field>
                <Field label="الوصف"><textarea rows={2} className={inputCls} value={settings.general.description} onChange={(e) => set('general', 'description', e.target.value)} /></Field>
                <Field label="البريد الإلكتروني"><input className={inputCls} dir="ltr" value={settings.general.email} onChange={(e) => set('general', 'email', e.target.value)} /></Field>
                <Field label="العنوان"><input className={inputCls} value={settings.general.address} onChange={(e) => set('general', 'address', e.target.value)} /></Field>
              </div>
            </Card>
            <Card><CardHeader title="التواصل" icon={SettingsIcon} />
              <div className="p-4 space-y-3">
                <Field label="رقم الهاتف"><input className={inputCls} dir="ltr" value={settings.general.phone} onChange={(e) => set('general', 'phone', e.target.value)} /></Field>
                <Field label="ساعات العمل"><input className={inputCls} value={settings.general.businessHours} onChange={(e) => set('general', 'businessHours', e.target.value)} /></Field>
              </div>
            </Card>
          </>
        )}

        {tab === 'appearance' && (
          <Card className="lg:col-span-2"><CardHeader title="المظهر" icon={SettingsIcon} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="اللون الأساسي"><div className="flex items-center gap-2"><input type="color" value={settings.appearance.primaryColor} onChange={(e) => set('appearance', 'primaryColor', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200" /><input className={inputCls} dir="ltr" value={settings.appearance.primaryColor} onChange={(e) => set('appearance', 'primaryColor', e.target.value)} /></div></Field>
              <Field label="شريط الإعلان"><input className={inputCls} value={settings.appearance.announcement} onChange={(e) => set('appearance', 'announcement', e.target.value)} /></Field>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">إظهار شريط الإعلان</span><Toggle checked={settings.appearance.announcementEnabled} onChange={(v) => set('appearance', 'announcementEnabled', v)} /></div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">زر WhatsApp العائم</span><Toggle checked={settings.appearance.showWhatsAppButton !== false} onChange={(v) => set('appearance', 'showWhatsAppButton', v)} /></div>
            </div>
          </Card>
        )}

        {tab === 'products' && (
          <Card className="lg:col-span-2"><CardHeader title="إعدادات المنتجات والمخزون" icon={SettingsIcon} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="حد الشحن المجاني (ج.م)"><input type="number" className={inputCls} value={settings.store.freeShippingThreshold} onChange={(e) => set('store', 'freeShippingThreshold', Number(e.target.value))} /></Field>
              <Field label="حد تنبيه المخزون المنخفض"><input type="number" className={inputCls} value={settings.store.lowStockThreshold} onChange={(e) => set('store', 'lowStockThreshold', Number(e.target.value))} /></Field>
              <Field label="نسبة الضريبة (%)"><input type="number" step="0.01" className={inputCls} value={settings.store.vatRate} onChange={(e) => set('store', 'vatRate', Number(e.target.value))} /></Field>
              <Field label="العملة"><input className={inputCls} dir="ltr" value={settings.store.currency} onChange={(e) => set('store', 'currency', e.target.value)} /></Field>
            </div>
          </Card>
        )}

        {tab === 'seo' && (
          <Card className="lg:col-span-2"><CardHeader title="إعدادات SEO" icon={SettingsIcon} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="العنوان العالمي" className="sm:col-span-2"><input className={inputCls} value={settings.seo.globalTitle} onChange={(e) => set('seo', 'globalTitle', e.target.value)} /></Field>
              <Field label="Meta Description" className="sm:col-span-2"><textarea rows={2} className={inputCls} value={settings.seo.metaDescription} onChange={(e) => set('seo', 'metaDescription', e.target.value)} /></Field>
              <Field label="الكلمات المفتاحية" className="sm:col-span-2"><input className={inputCls} value={settings.seo.globalKeywords} onChange={(e) => set('seo', 'globalKeywords', e.target.value)} /></Field>
            </div>
          </Card>
        )}

        {tab === 'analytics' && (
          <Card className="lg:col-span-2"><CardHeader title="التحليلات" icon={SettingsIcon} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="GA4 ID"><input className={inputCls} dir="ltr" value={settings.analytics.ga4Id} onChange={(e) => set('analytics', 'ga4Id', e.target.value)} placeholder="G-XXXX" /></Field>
              <Field label="Search Console"><input className={inputCls} dir="ltr" value={settings.analytics.searchConsoleVerification} onChange={(e) => set('analytics', 'searchConsoleVerification', e.target.value)} /></Field>
              <div className="sm:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">تسجيل الأحداث</span><Toggle checked={settings.analytics.eventTracking !== false} onChange={(v) => set('analytics', 'eventTracking', v)} /></div>
            </div>
          </Card>
        )}

        {tab === 'whatsapp' && (
          <Card className="lg:col-span-2"><CardHeader title="WhatsApp" icon={SettingsIcon} />
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="رقم الواتساب"><input className={inputCls} dir="ltr" value={settings.whatsapp.phone} onChange={(e) => set('whatsapp', 'phone', e.target.value)} /></Field>
              <Field label="الرسالة الافتراضية"><input className={inputCls} value={settings.whatsapp.defaultMessage} onChange={(e) => set('whatsapp', 'defaultMessage', e.target.value)} /></Field>
              <Field label="قالب رسالة المنتج" className="sm:col-span-2"><textarea rows={2} className={inputCls} value={settings.whatsapp.productTemplate} onChange={(e) => set('whatsapp', 'productTemplate', e.target.value)} /></Field>
            </div>
          </Card>
        )}

        {tab === 'security' && (
          <Card className="lg:col-span-2"><CardHeader title="الأمان والصلاحيات" icon={ShieldCheck} />
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3 leading-5">نظام الصلاحيات مخصص لدعم <b>Admin / Editor / Viewer</b> مستقبلاً. حالياً تعمل لوحة التحكم بدون تسجيل دخول (البيانات محلية على المتصفح).</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[{ r: 'admin', t: 'Admin', d: 'كل الصلاحيات', icon: UserCog, cls: 'border-emerald-200 bg-emerald-50' }, { r: 'editor', t: 'Editor', d: 'إدارة المنتجات والمحتوى', icon: Eye, cls: 'border-blue-200 bg-blue-50' }, { r: 'viewer', t: 'Viewer', d: 'عرض فقط', icon: Users, cls: 'border-slate-200 bg-slate-50' }].map((r) => (
                  <div key={r.r} className={`p-3 rounded-2xl border ${r.cls}`}>
                    <r.icon className="w-5 h-5 mb-1.5" />
                    <p className="text-sm font-black text-slate-800">{r.t}</p>
                    <p className="text-[11px] text-slate-500">{r.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2"><Database className="w-4 h-4 shrink-0 mt-0.5" /><p>البيانات محفوظة محلياً في متصفحك (localStorage) — لنسخ آمن استخدم مركز النسخ الاحتياطي.</p></div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function CheckMark() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
