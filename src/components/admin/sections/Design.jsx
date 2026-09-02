import React, { useState } from 'react';
import { Palette, Save, RefreshCw, Eye, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { SectionHeader, Card, CardHeader, Field, inputCls, Toggle, Button } from '../ui';
import { getSettings, saveSettings } from '../../../lib/settings';

const HOMEPAGE_SECTIONS = [
  { id: 'hero', label: 'الواجهة الرئيسية (Hero)', icon: 'Sparkles', defaultEnabled: true },
  { id: 'features', label: 'شريط المميزات', icon: 'BadgeCheck', defaultEnabled: true },
  { id: 'categories', label: 'التصنيفات المميزة', icon: 'LayoutGrid', defaultEnabled: true },
  { id: 'flash', label: 'عروض الفلاش', icon: 'Flame', defaultEnabled: true },
  { id: 'products', label: 'كتالوج المنتجات', icon: 'Package', defaultEnabled: true },
  { id: 'policies', label: 'السياسات والضمان', icon: 'ShieldCheck', defaultEnabled: true },
  { id: 'faq', label: 'الأسئلة الشائعة', icon: 'HelpCircle', defaultEnabled: true },
];

export default function Design({ ctx }) {
  const { notify } = ctx;
  const [settings, setSettings] = useState(getSettings());
  const [saved, setSaved] = useState(false);
  const [homeOrder, setHomeOrder] = useState(() => {
    const stored = localStorage.getItem('omran_home_sections');
    if (stored) try { return JSON.parse(stored); } catch {}
    return HOMEPAGE_SECTIONS.map((s, i) => ({ id: s.id, enabled: s.defaultEnabled, order: i }));
  });

  const set = (section, key, value) => setSettings((s) => ({ ...s, [section]: { ...s[section], [key]: value } }));

  const persistHome = (next) => {
    setHomeOrder(next);
    localStorage.setItem('omran_home_sections', JSON.stringify(next));
  };

  const move = (id, dir) => {
    const sorted = [...homeOrder].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((x) => x.id === id);
    const j = idx + dir;
    if (j < 0 || j >= sorted.length) return;
    const tmp = sorted[idx];
    sorted[idx] = sorted[j];
    sorted[j] = tmp;
    const next = sorted.map((x, i) => ({ ...x, order: i }));
    persistHome(next);
  };

  const toggleSection = (id) => {
    const next = homeOrder.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x));
    persistHome(next);
  };

  const save = () => {
    const primary = settings.appearance.primaryColor;
    if (!/^#[0-9A-Fa-f]{6}$/.test(primary)) { notify('لون غير صالح — استخدم صيغة #RRGGBB', 'error'); return; }
    saveSettings(settings);
    localStorage.setItem('omran_toys_last_saved', new Date().toISOString());
    setSaved(true);
    notify('تم حفظ إعدادات التصميم');
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    if (window.confirm('هل تريد إعادة ضبط إعدادات التصميم للافتراضي؟')) {
      localStorage.removeItem('omran_toys_site_settings');
      setSettings(getSettings());
      notify('تمت إعادة الضبط');
    }
  };

  const sortedHome = [...homeOrder].sort((a, b) => a.order - b.order);

  return (
    <div>
      <SectionHeader title="مركز تصميم الموقع" subtitle="التحكم بهوية الموقع وظهوره" icon={Palette}
        action={<div className="flex gap-2"><Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4" /> إعادة ضبط</Button><Button onClick={save}>{saved ? <CheckMark /> : <Save className="w-4 h-4" />} {saved ? 'تم الحفظ' : 'حفظ'}</Button></div>} />

      {/* Live preview banner */}
      <Card className="mb-4 overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Eye className="w-4 h-4 text-toy-yellow" />
            معاينة حية للهوية
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full">{settings.general.siteName}</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900" style={{ color: settings.appearance.primaryColor }}>{settings.general.siteName}</span>
              <span className="text-xs text-slate-400">{settings.general.tagline}</span>
            </div>
            <Button variant="dark" style={undefined} className="!bg-toy-red"><ArrowRight className="w-4 h-4" /> تسوق الآن</Button>
          </div>
          {settings.appearance.announcementEnabled && (
            <div className="rounded-xl p-2.5 text-xs font-bold text-white" style={{ background: settings.appearance.primaryColor }}>
              {settings.appearance.announcement}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500 text-white px-3 py-1.5 text-xs font-black inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> اطلب عبر WhatsApp</span>
            <span className="text-xs text-slate-400">الألوان والخطوط تُطبق هنا</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Appearance */}
        <Card>
          <CardHeader title="المظهر والألوان" icon={Palette} />
          <div className="p-4 space-y-3">
            <Field label="اللون الأساسي"><div className="flex items-center gap-2"><input type="color" value={settings.appearance.primaryColor} onChange={(e) => set('appearance', 'primaryColor', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" /><input className={inputCls} dir="ltr" value={settings.appearance.primaryColor} onChange={(e) => set('appearance', 'primaryColor', e.target.value)} /></div></Field>
            <Field label="شريط الإعلان"><input className={inputCls} value={settings.appearance.announcement} onChange={(e) => set('appearance', 'announcement', e.target.value)} /></Field>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">إظهار شريط الإعلان</span><Toggle checked={settings.appearance.announcementEnabled} onChange={(v) => set('appearance', 'announcementEnabled', v)} /></div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">إظهار زر WhatsApp العائم</span><Toggle checked={settings.appearance.showWhatsAppButton !== false} onChange={(v) => set('appearance', 'showWhatsAppButton', v)} /></div>
          </div>
        </Card>

        {/* General identity */}
        <Card>
          <CardHeader title="الهوية العامة" icon={Sparkles} />
          <div className="p-4 space-y-3">
            <Field label="اسم المتجر (عربي)"><input className={inputCls} value={settings.general.siteName} onChange={(e) => set('general', 'siteName', e.target.value)} /></Field>
            <Field label="اسم المتجر (إنجليزي)"><input className={inputCls} dir="ltr" value={settings.general.siteNameEn} onChange={(e) => set('general', 'siteNameEn', e.target.value)} /></Field>
            <Field label="الشعار"><input className={inputCls} dir="ltr" value="/brand/logo.png" readOnly /><span className="text-[10px] text-slate-400">ضع ملف logo.png في مجلد public/brand لاستبداله</span></Field>
            <Field label="الوصف التعريفي"><textarea rows={2} className={inputCls} value={settings.general.description} onChange={(e) => set('general', 'description', e.target.value)} /></Field>
            <Field label="ساعات العمل"><input className={inputCls} value={settings.general.businessHours} onChange={(e) => set('general', 'businessHours', e.target.value)} /></Field>
          </div>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader title="التنقل (Navigation)" icon={Sparkles} />
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">إظهار التصنيفات</span><Toggle checked={settings.navigation.showCategories !== false} onChange={(v) => set('navigation', 'showCategories', v)} /></div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">إظهار البحث</span><Toggle checked={settings.navigation.showSearch !== false} onChange={(v) => set('navigation', 'showSearch', v)} /></div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="text-xs font-bold text-slate-700">إظهار السلة</span><Toggle checked={settings.navigation.showCart !== false} onChange={(v) => set('navigation', 'showCart', v)} /></div>
          </div>
        </Card>

        {/* Store settings */}
        <Card>
          <CardHeader title="إعدادات المتجر" icon={Sparkles} />
          <div className="p-4 space-y-3">
            <Field label="حد تنبيه المخزون المنخفض"><input type="number" className={inputCls} value={settings.store.lowStockThreshold} onChange={(e) => set('store', 'lowStockThreshold', Number(e.target.value))} /></Field>
            <Field label="نسبة الضريبة"><input type="number" step="0.01" className={inputCls} value={settings.store.vatRate} onChange={(e) => set('store', 'vatRate', Number(e.target.value))} /></Field>
          </div>
        </Card>
      </div>

      {/* Homepage builder */}
      <Card className="mt-4">
        <CardHeader title="ترتيب أقسام الصفحة الرئيسية" subtitle="اسحب للترتيب أو فعّل/عطّل" icon={Sparkles} />
        <div className="p-4">
          <div className="space-y-2">
            {sortedHome.map((sec) => {
              const meta = HOMEPAGE_SECTIONS.find((h) => h.id === sec.id) || {};
              return (
                <div key={sec.id} className={`flex items-center gap-2 p-3 rounded-xl border ${sec.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => move(sec.id, -1)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><MoveUp /></button>
                    <button onClick={() => move(sec.id, 1)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><MoveDown /></button>
                  </div>
                  <span className="text-xs font-bold text-slate-700 flex-1">{meta.label || sec.id}</span>
                  <Toggle checked={sec.enabled} onChange={() => toggleSection(sec.id)} />
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function CheckMark() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function MoveUp() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function MoveDown() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
