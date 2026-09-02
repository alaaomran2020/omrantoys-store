/**
 * EditProductPage — المكوّن المركزي للدور محدود الصلاحية.
 * ══════════════════════════════════════════════════════════════
 * ما يمكن تعديله (وفق صلاحيات المدير القادمة من الخادم):
 *   ✔ اسم المنتج (عربي/إنجليزي)   — products.name
 *   ✔ سعر المنتج (بيع + قبل الخصم) — products.price
 *   ✔ وصف المنتج                   — products.description
 *   ✔ صور المنتج (إضافة/إزالة/ترتيب) — products.images
 * ما هو "قراءة فقط" (يُعرض مقفلاً ولا يُرسل للخادم إطلاقاً):
 *   ✘ SKU، الفئة، المخزون، الظهور، أسعار الجملة
 *
 * نموذج الإرسال: PATCH يَحمل الحقول المتسخة (dirty) من النموذج فقط —
 * حتى لو عُبث بالواجهة وأرسل أحدهم حقلاً محظوراً، سيرفضه الخادم
 * بـ 403 ويسجّل المحاولة في admin_audit_log (إنفاز مزدوج UI+API).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminProduct, patchAdminProduct, editableFields, formatEGP } from '../lib/adminAuth';
import { useAdminSession } from './AdminApp';
import {
  BrutalCard, BrutalInput, BrutalTextarea, BrutalLabel, PrimaryCta, ActionButton,
  LockBadge, SectionTitle, Notice,
} from './ui';

export default function EditProductPage({ id, navigate }) {
  const { session } = useAdminSession();
  const admin = session?.admin;
  const editable = useMemo(() => editableFields(admin), [admin]);

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ name_ar: '', name_en: '', retail_price: '', original_price: '', description: '', images: [] });
  const [dirty, setDirty] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deniedFields, setDeniedFields] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // تحميل المنتج من D1 عبر الـ API المحمي
  useEffect(() => {
    let alive = true;
    fetchAdminProduct(id)
      .then((res) => {
        if (!alive) return;
        setProduct(res.product);
        setForm({
          name_ar: res.product.name_ar || '',
          name_en: res.product.name_en || '',
          retail_price: res.product.retail_price ?? '',
          original_price: res.product.original_price ?? '',
          description: res.product.description || '',
          images: Array.isArray(res.product.images) ? res.product.images : [],
        });
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty((d) => new Set(d).add(field));
    setSuccess(''); setError(''); setDeniedFields(null);
  };

  // حساب الخصم الحي (قيمة عرضية)
  const discount = useMemo(() => {
    const price = Number(form.retail_price);
    const original = Number(form.original_price);
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  }, [form.retail_price, form.original_price]);

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setDeniedFields(null);

    // نبني الحمولة من الحقول المتسخة المسموح بها فقط
    const payload = {};
    for (const field of dirty) {
      if (!['name_ar', 'name_en', 'retail_price', 'original_price', 'description', 'images'].includes(field)) continue;
      payload[field] = field === 'images' ? form.images
        : (field === 'retail_price' || field === 'original_price')
          ? (form[field] === '' ? null : Number(form[field]))
          : form[field];
    }
    if (Object.keys(payload).length === 0) {
      setError('لم تُجرِ أي تعديل بعد.');
      return;
    }
    if (payload.name_ar !== undefined && !String(payload.name_ar).trim()) {
      setError('اسم المنتج العربي لا يمكن أن يكون فارغاً.');
      return;
    }
    if (payload.retail_price !== undefined && payload.retail_price !== null && !(Number(payload.retail_price) >= 0)) {
      setError('أدخل سعر بيع صالحاً (0 أو أكثر).');
      return;
    }

    setSaving(true);
    try {
      const res = await patchAdminProduct(product.id, payload);
      setProduct(res.product);
      setDirty(new Set());
      setSuccess(`تم الحفظ في D1 ✓ — الحقول: ${res.updated_fields.map(arFieldName).join('، ')}`);
    } catch (err) {
      setError(err.message);
      if (err.payload?.denied_fields) setDeniedFields(err.payload.denied_fields);
    } finally { setSaving(false); }
  }

  // ------- إدارة الصور -------
  const addImage = () => {
    const url = newImageUrl.trim();
    if (!/^\/|https?:\/\//.test(url)) { setError('رابط الصورة يجب أن يبدأ بـ / أو https://'); return; }
    if (form.images.length >= 8) { setError('الحد الأقصى 8 صور.'); return; }
    setField('images', [...form.images, url]);
    setNewImageUrl('');
  };
  const removeImage = (idx) => setField('images', form.images.filter((_, i) => i !== idx));
  const moveImage = (idx, dir) => {
    const next = [...form.images];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setField('images', next);
  };

  if (loading) {
    return <div className="py-20 text-center font-mono text-xs tracking-[0.4em] text-slate-500 uppercase">…LOADING PRODUCT</div>;
  }
  if (!product) {
    return (
      <div className="space-y-4">
        <Notice kind="error">{error || 'المنتج غير موجود'}</Notice>
        <ActionButton variant="blue" onClick={() => navigate('/admin/products')}>→ عودة للقائمة</ActionButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <SectionTitle kicker={`PRODUCT / EDIT / ${product.sku}`} title={product.name_ar}>
        <div className="flex items-center gap-2">
          <LockBadge text="دور محدود: اسم·سعر·وصف·صورة" />
        </div>
      </SectionTitle>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ═════════ العمود الرئيسي: الحقول القابلة للتعديل ═════════ */}
        <div className="space-y-6 lg:col-span-2">

          {/* ── الاسم ── */}
          <EditablePanel title="الاسم" permissionKey="products.name" unlocked={editable.name} icon="name">
            {editable.name ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <BrutalLabel htmlFor="name_ar">الاسم بالعربية *</BrutalLabel>
                  <BrutalInput id="name_ar" value={form.name_ar} invalid={dirty.has('name_ar') && !form.name_ar.trim()}
                    onChange={(e) => setField('name_ar', e.target.value)} maxLength={200} />
                </div>
                <div>
                  <BrutalLabel htmlFor="name_en">الاسم بالإنجليزية</BrutalLabel>
                  <BrutalInput id="name_en" dir="ltr" value={form.name_en}
                    onChange={(e) => setField('name_en', e.target.value)} maxLength={200} />
                </div>
              </div>
            ) : (
              <ReadOnlyValue value={`${form.name_ar} — ${form.name_en || ''}`} />
            )}
          </EditablePanel>

          {/* ── السعر ── */}
          <EditablePanel title="السعر" permissionKey="products.price" unlocked={editable.price} icon="price">
            {editable.price ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <BrutalLabel htmlFor="retail_price">سعر البيع (ج.م) *</BrutalLabel>
                    <BrutalInput id="retail_price" dir="ltr" inputMode="decimal" value={form.retail_price}
                      onChange={(e) => setField('retail_price', e.target.value.replace(/[^\d.]/g, ''))} />
                  </div>
                  <div>
                    <BrutalLabel htmlFor="original_price">السعر قبل الخصم (اختياري)</BrutalLabel>
                    <BrutalInput id="original_price" dir="ltr" inputMode="decimal" value={form.original_price ?? ''}
                      onChange={(e) => setField('original_price', e.target.value.replace(/[^\d.]/g, ''))} />
                  </div>
                </div>
                <div className="mt-3 border-2 border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-400" dir="rtl">
                  الخصم المعروض: <b className={discount > 0 ? 'text-sunbeam' : 'text-slate-500'}>{discount}%</b>
                  {' '}· بعد الحفظ: <b className="text-electric-soft">{formatEGP(form.retail_price)}</b>
                </div>
              </>
            ) : (
              <ReadOnlyValue value={formatEGP(form.retail_price)} />
            )}
          </EditablePanel>

          {/* ── الوصف ── */}
          <EditablePanel title="الوصف" permissionKey="products.description" unlocked={editable.description} icon="desc">
            {editable.description ? (
              <>
                <BrutalLabel htmlFor="description">وصف المنتج</BrutalLabel>
                <BrutalTextarea id="description" value={form.description} maxLength={5000}
                  onChange={(e) => setField('description', e.target.value)} />
                <div className="mt-1 text-left font-mono text-[10px] text-slate-600" dir="ltr">
                  {form.description.length}/5000
                </div>
              </>
            ) : (
              <ReadOnlyValue value={form.description || '— لا وصف —'} />
            )}
          </EditablePanel>

          {/* ── الصور ── */}
          <EditablePanel title="الصور" permissionKey="products.images" unlocked={editable.images} icon="img">
            {editable.images ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[240px]">
                    <BrutalInput dir="ltr" placeholder="https://… أو /path/img.png" value={newImageUrl}
                      onChange={(e) => { setNewImageUrl(e.target.value); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())} />
                  </div>
                  <ActionButton type="button" variant="blue" onClick={addImage}>+ إضافة صورة</ActionButton>
                </div>
                {form.images.length === 0 && (
                  <div className="border-2 border-dashed border-slate-700 py-8 text-center text-sm text-slate-500">
                    لا صور — أضف رابط صورة المنتج
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {form.images.map((src, i) => (
                    <div key={`${src}-${i}`} className="group border-2 border-slate-700 bg-slate-950">
                      <div className="relative overflow-hidden border-b-2 border-slate-800">
                        <img src={src} alt={`صورة ${i + 1}`} className="h-32 w-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 right-1 bg-electric px-1.5 py-0.5 font-mono text-[9px] font-black text-white">رئيسية</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-1.5">
                        <div className="flex gap-1">
                          <IconBtn title="تقديم" onClick={() => moveImage(i, -1)} disabled={i === 0}>→</IconBtn>
                          <IconBtn title="تأخير" onClick={() => moveImage(i, +1)} disabled={i === form.images.length - 1}>←</IconBtn>
                        </div>
                        <IconBtn danger title="إزالة" onClick={() => removeImage(i)}>✕</IconBtn>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 font-mono text-[10px] text-slate-600" dir="rtl">
                  الحد 8 صور — الأولى تظهر كصورة رئيسية في المتجر.
                </p>
              </>
            ) : (
              <div className="flex flex-wrap gap-3">
                {form.images.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-20 w-20 border-2 border-slate-700 object-cover grayscale" />
                ))}
              </div>
            )}
          </EditablePanel>
        </div>

        {/* ═════════ العمود الجانبي: بيانات مقفلة ═════════ */}
        <div className="space-y-6">
          <BrutalCard className="p-4">
            <div className="mb-3 flex items-center justify-between border-b-2 border-ink-deep pb-2">
              <h3 className="font-mono text-[11px] font-black tracking-[0.25em] text-slate-400 uppercase">بيانات مقفلة</h3>
              <LockBadge />
            </div>
            <dl className="space-y-3 text-sm">
              <LockedRow label="SKU" value={product.sku} ltr />
              <LockedRow label="المخزون" value={String(product.stock_quantity ?? '—')} ltr />
              <LockedRow label="الفئة" value={product.category_id || '—'} ltr />
              <LockedRow label="أسعار الجملة" value={product.wholesale_price != null ? formatEGP(product.wholesale_price) : '—'} />
              <LockedRow label="الظهور بالمتجر" value={product.is_active ? 'ظاهر' : 'مخفي'} />
            </dl>
            <p className="mt-4 border-t-2 border-slate-800 pt-3 font-mono text-[10px] leading-5 text-slate-600">
              هذه الحقول للقراءة فقط — أي محاولة PATCH عليها تُرفض بـ 403 وتُسجَّل في سجل التدقيق.
            </p>
          </BrutalCard>

          {/* صندوق الحفظ — زر Sunbeam الأصفر الحصري */}
          <BrutalCard className="sticky top-4 p-4">
            {success && <div className="mb-3"><Notice kind="success">{success}</Notice></div>}
            {error && <div className="mb-3"><Notice kind="error">{error}</Notice></div>}
            {deniedFields && (
              <div className="mb-3 font-mono text-[10px] leading-5 text-red-400" dir="ltr">
                DENIED: {deniedFields.map((d) => d.field).join(', ')}
              </div>
            )}
            <div className="mb-3 font-mono text-[10px] tracking-widest text-slate-500 uppercase" dir="ltr">
              DIRTY: {dirty.size ? [...dirty].join(', ') : '— none —'}
            </div>
            <PrimaryCta type="submit" disabled={saving || dirty.size === 0} className="w-full">
              {saving ? '…جارٍ الحفظ في D1' : 'حفظ التعديلات'}
            </PrimaryCta>
            <ActionButton type="button" variant="ghost" className="mt-3 w-full" onClick={() => navigate('/admin/products')}>
              → عودة بدون حفظ
            </ActionButton>
          </BrutalCard>
        </div>
      </div>
    </form>
  );
}

// --------------------------- عناصر مساعدة ---------------------------

function EditablePanel({ title, permissionKey, unlocked, icon: _icon, children }) {
  return (
    <BrutalCard className={`p-5 ${unlocked ? '' : 'opacity-90'}`}>
      <div className="mb-4 flex items-center justify-between border-b-2 border-ink-deep pb-3">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-100">
          <span className={`inline-block h-3 w-3 border-2 border-ink-deep ${unlocked ? 'bg-electric' : 'bg-slate-700'}`} />
          {title}
        </h3>
        <span dir="ltr" className={`font-mono text-[10px] font-bold tracking-widest uppercase
          ${unlocked ? 'text-electric-soft' : 'text-slate-600'}`}>
          {permissionKey}{unlocked ? '' : ' ✕'}
        </span>
      </div>
      {children}
    </BrutalCard>
  );
}

function ReadOnlyValue({ value }) {
  return (
    <div className="border-2 border-slate-800 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-slate-400">
      {value}
    </div>
  );
}

function LockedRow({ label, value, ltr }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">{label}</dt>
      <dd className={`font-bold text-slate-400 ${ltr ? 'font-mono' : ''}`} dir={ltr ? 'ltr' : 'rtl'}>{value}</dd>
    </div>
  );
}

function IconBtn({ children, danger, ...props }) {
  return (
    <button {...props} className={`h-7 w-7 rounded-none border-2 font-mono text-xs font-black transition-colors
      ${danger
        ? 'border-red-900 text-red-400 hover:border-red-500 hover:bg-red-950'
        : 'border-slate-700 text-slate-400 hover:border-electric hover:text-electric-soft disabled:opacity-30 disabled:hover:border-slate-700 disabled:hover:text-slate-400'}`}>
      {children}
    </button>
  );
}

const AR_FIELDS = {
  name_ar: 'الاسم (عربي)', name_en: 'الاسم (إنجليزي)',
  retail_price: 'سعر البيع', original_price: 'السعر قبل الخصم',
  description: 'الوصف', images: 'الصور',
};
const arFieldName = (f) => AR_FIELDS[f] || f;
