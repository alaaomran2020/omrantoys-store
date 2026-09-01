import React, { useMemo, useState } from 'react';
import {
  Plus, Edit, Trash2, Copy, Eye, Search, Package,
  EyeOff, Check, ChevronLeft, ChevronRight, Download, Star, Archive, X,
} from 'lucide-react';
import { SectionHeader, Card, Button, Badge, EmptyState, Field, inputCls, ConfirmDialog, Select } from '../ui';
import { categories, activeCategories, ageGroups } from '../../../data/categories';
import { exportProducts } from '../../../lib/exporters';
import { track, EVENTS } from '../../../lib/analytics';

const PER_PAGE = 10;

export default function Products({ ctx }) {
  const { products, addProduct, updateProduct, deleteProduct, notify, formatPrice } = ctx;
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null); // product or 'new'
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(null);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (filterStatus === 'active') list = list.filter((p) => p.stock > 0 && p.is_visible !== false);
    if (filterStatus === 'hidden') list = list.filter((p) => p.is_visible === false);
    if (filterStatus === 'out') list = list.filter((p) => (p.stock || 0) <= 0);
    return list;
  }, [products, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const catName = (id) => categories.find((c) => c.id === id)?.name || id;
  const ageLabel = (id) => ageGroups.find((a) => a.id === id)?.label || id;

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const allSelected = pageItems.length > 0 && pageItems.every((p) => selected.includes(p.id));

  const doDelete = (id) => { deleteProduct(id); setConfirmDelete(null); notify('تم حذف المنتج'); };
  const doBulkDelete = () => { selected.forEach((id) => deleteProduct(id)); notify(`تم حذف ${selected.length} منتجات`); setSelected([]); setConfirmBulk(null); };
  const duplicate = (p) => {
    const copy = { ...p, id: Date.now(), sku: p.sku ? `${p.sku}-COPY` : undefined, name: `${p.name} (نسخة)`, isNew: true };
    delete copy.createdAt;
    addProduct(copy);
    notify('تم تكرار المنتج');
  };
  const toggleVisible = (p) => updateProduct({ ...p, is_visible: p.is_visible === false ? true : false });
  const copyData = (p) => {
    navigator.clipboard.writeText(JSON.stringify(p, null, 2));
    notify('تم نسخ بيانات المنتج');
  };
  const view = (p) => {
    track(EVENTS.productView, { productId: p.id });
    ctx.openProduct(p);
  };

  return (
    <div>
      <SectionHeader title="إدارة المنتجات" subtitle={`${products.length} منتج إجمالاً`} icon={PackageIcon}
        action={<Button onClick={() => setEditing('new')}><Plus className="w-4 h-4" /> إضافة منتج</Button>} />

      {/* Toolbar */}
      <Card className="p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-2.5 md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="بحث بالاسم، SKU، الماركة..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-toy-red" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }}
              options={[{ value: 'all', label: 'كل الحالات' }, { value: 'active', label: 'نشط' }, { value: 'hidden', label: 'مخفي' }, { value: 'out', label: 'نفد المخزون' }]} className="w-36" />
            <Button variant="outline" onClick={() => exportProducts(filtered, 'csv')}><Download className="w-4 h-4" /> تصدير CSV</Button>
            {selected.length > 0 && (
              <Button variant="danger" onClick={() => setConfirmBulk({ mode: 'delete' })}><Trash2 className="w-4 h-4" /> حذف ({selected.length})</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-8"><input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelected([]) : setSelected(pageItems.map((p) => p.id))} className="accent-toy-red w-4 h-4" /></th>
                <th className="p-3">المنتج</th>
                <th className="p-3">SKU</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">السعر</th>
                <th className="p-3">المخزون</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">المشاهدات</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 && (
                <tr><td colSpan={9}><EmptyState icon={PackageIcon} title="لا توجد منتجات مطابقة" hint="جرّب تغيير البحث أو الفلتر" action={<Button onClick={() => setEditing('new')}><Plus className="w-4 h-4" /> إضافة منتج</Button>} /></td></tr>
              )}
              {pageItems.map((p) => {
                const views = ctx.viewsByProduct[p.id] || 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="p-3"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="accent-toy-red w-4 h-4" /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" /> : <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0 flex items-center justify-center text-slate-300"><ImageOff className="w-4 h-4" /></div>}
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-[180px]">{p.name}</span>
                          {p.isFeatured && <Badge tone="amber">مميز</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{p.sku || '—'}</td>
                    <td className="p-3 text-slate-600">{catName(p.category)}</td>
                    <td className="p-3 font-bold text-toy-red">{formatPrice(p.price ?? p.retail_price)}</td>
                    <td className="p-3"><span className={`font-bold ${p.stock <= 0 ? 'text-rose-600' : p.stock <= 10 ? 'text-amber-600' : 'text-slate-700'}`}>{p.stock}</span></td>
                    <td className="p-3">{p.is_visible === false ? <Badge tone="slate">مخفي</Badge> : p.stock <= 0 ? <Badge tone="red">نفد</Badge> : <Badge tone="green">نشط</Badge>}</td>
                    <td className="p-3 text-slate-500">{views || 0}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditing(p)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" title="تعديل"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => view(p)} className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer" title="معاينة"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => duplicate(p)} className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer" title="تكرار"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleVisible(p)} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer" title={p.is_visible === false ? 'إظهار' : 'إخفاء'}>{p.is_visible === false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                        <button onClick={() => copyData(p)} className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg cursor-pointer" title="نسخ البيانات"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(p)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-slate-100 text-[11px] text-slate-400">
          <span>عرض {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} من {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            <span className="font-bold text-slate-600 px-2">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          </div>
        </div>
      </Card>

      {editing && <ProductEditor product={editing === 'new' ? null : editing} ctx={ctx} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={!!confirmDelete} title="حذف المنتج" message={`هل أنت متأكد من حذف "${confirmDelete?.name}"؟ لا يمكن التراجع.`} danger onCancel={() => setConfirmDelete(null)} onConfirm={() => doDelete(confirmDelete.id)} />
      <ConfirmDialog open={!!confirmBulk} title="حذف مجموعة منتجات" message={`هل تريد حذف ${selected.length} منتج نهائياً؟`} danger onCancel={() => setConfirmBulk(null)} onConfirm={doBulkDelete} />
    </div>
  );
}

const PackageIcon = Package;
const ImageOff = Archive;

function ProductEditor({ product, ctx, onClose }) {
  const { addProduct, updateProduct, notify, formatPrice } = ctx;
  const isNew = !product;
  const [form, setForm] = useState(() => product ? {
    ...product,
    price: product.price ?? product.retail_price ?? '',
    imageInput: '',
  } : {
    name: '', nameEn: '', category: 'educational', brand: '', price: '', originalPrice: '', stock: 20,
    ageGroup: '6-8', description: '', images: [], tags: [], sku: '', isFeatured: false, is_visible: true, imageInput: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addImage = () => {
    const url = form.imageInput.trim();
    if (!url) return;
    set('images', [...(form.images || []), url]);
    set('imageInput', '');
  };
  const removeImage = (i) => set('images', form.images.filter((_, idx) => idx !== i));
  const makeMain = (i) => {
    const imgs = [...form.images];
    const [item] = imgs.splice(i, 1);
    imgs.unshift(item);
    set('images', imgs);
  };
  const addTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      set('tags', [...(form.tags || []), e.target.value.trim()]);
      e.target.value = '';
    }
  };
  const removeTag = (i) => set('tags', form.tags.filter((_, idx) => idx !== i));

  const errors = [];
  if (!form.name?.trim()) errors.push('اسم المنتج مطلوب');
  if (form.price === '' || Number(form.price) <= 0) errors.push('السعر مطلوب وأكبر من صفر');

  const save = () => {
    if (errors.length) { notify(errors[0], 'error'); return; }
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
      stock: Number(form.stock) || 0,
      images: form.images && form.images.length ? form.images : ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'],
      updatedAt: new Date().toISOString(),
    };
    delete payload.imageInput;
    if (isNew) {
      payload.id = Date.now();
      payload.createdAt = new Date().toISOString();
      payload.isNew = true;
      payload.sku = form.sku || `OMR-${Math.floor(100 + Math.random() * 900)}`;
      addProduct(payload);
      notify('تم نشر المنتج في المتجر 🚀');
    } else {
      updateProduct(payload);
      notify('تم حفظ تعديلات المنتج');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl my-auto max-h-[94vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-2">
            {isNew ? <Plus className="w-5 h-5 text-toy-yellow" /> : <Edit className="w-5 h-5 text-toy-yellow" />}
            <h3 className="font-black text-sm">{isNew ? 'إضافة منتج جديد' : `تعديل: ${product.name}`}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl">
              {errors.map((e) => <p key={e}>⚠ {e}</p>)}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="اسم المنتج (عربي)" required className="sm:col-span-2"><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="مثال: سيارة شرطة لاسلكية ذكية" /></Field>
            <Field label="الاسم بالإنجليزية"><input className={inputCls} dir="ltr" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} /></Field>
            <Field label="SKU"><input className={inputCls} dir="ltr" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="OMR-XXX" /></Field>
            <Field label="التصنيف"><Select value={form.category} onChange={(v) => set('category', v)} options={activeCategories.slice(1).map((c) => ({ value: c.id, label: c.name }))} /></Field>
            <Field label="الفئة العمرية"><Select value={form.ageGroup} onChange={(v) => set('ageGroup', v)} options={ageGroups.slice(1).map((a) => ({ value: a.id, label: a.label }))} /></Field>
            <Field label="سعر البيع (ج.م)" required><input type="number" min="1" className={inputCls} value={form.price} onChange={(e) => set('price', e.target.value)} /></Field>
            <Field label="السعر قبل الخصم"><input type="number" className={inputCls} value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} /></Field>
            <Field label="المخزون"><input type="number" min="0" className={inputCls} value={form.stock} onChange={(e) => set('stock', e.target.value)} /></Field>
            <Field label="الماركة"><input className={inputCls} value={form.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
          </div>

          <Field label="الوصف"><textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="اكتب وصفاً جذاباً..." /></Field>

          {/* Images */}
          <Field label="صور المنتج" hint="الصورة الأولى هي الصورة الرئيسية">
            <div className="flex gap-2 mb-2">
              <input className={inputCls} dir="ltr" value={form.imageInput} onChange={(e) => set('imageInput', e.target.value)} placeholder="https://... أضف رابط صورة" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())} />
              <Button onClick={addImage}><Plus className="w-4 h-4" /> إضافة</Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(form.images || []).map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200">
                  <img src={img} alt="" className="w-full h-20 object-cover" />
                  {i === 0 && <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">رئيسية</span>}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {i !== 0 && <button onClick={() => makeMain(i)} title="تعيين رئيسية" className="p-1 bg-white text-emerald-600 rounded-lg cursor-pointer"><Star className="w-3.5 h-3.5" /></button>}
                    <button onClick={() => removeImage(i)} title="حذف" className="p-1 bg-white text-rose-600 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {(form.images || []).length === 0 && <div className="col-span-full text-center text-xs text-slate-400 py-4 bg-slate-50 rounded-xl">لا توجد صور — أضف صورة أعلاه</div>}
            </div>
          </Field>

          {/* Tags */}
          <Field label="الوسوم (اضغط Enter لإضافة)" hint="تساعد في البحث">
            <div className="flex flex-wrap gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-2">
              {(form.tags || []).map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-[11px] font-bold px-2 py-1 rounded-full">
                  {t}
                  <button onClick={() => removeTag(i)} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <input className="bg-transparent flex-1 min-w-24 text-xs outline-none" placeholder="اكتب وسم..." onKeyDown={addTag} />
            </div>
          </Field>

          {/* Visibility + featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl cursor-pointer">
              <input type="checkbox" checked={!!form.is_visible} onChange={(e) => set('is_visible', e.target.checked)} className="accent-toy-red w-4 h-4" />
              ظاهر في المتجر
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-amber-50 p-3 rounded-xl cursor-pointer">
              <input type="checkbox" checked={!!form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="accent-amber-500 w-4 h-4" />
              منتج مميز (Featured)
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
          </div>
          <div className="flex gap-2">
            {!isNew && <Button variant="outline" onClick={() => { updateProduct({ ...form, is_visible: false, updatedAt: new Date().toISOString() }); notify('تم إخفاء المنتج'); onClose(); }}><EyeOff className="w-4 h-4" /> إخفاء</Button>}
            <Button onClick={save}><Check className="w-4 h-4" /> {isNew ? 'نشر المنتج' : 'حفظ التعديلات'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
