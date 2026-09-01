import React, { useState } from 'react';
import { Image as ImageIcon, AlertTriangle, Trash2, Star, Download } from 'lucide-react';
import { SectionHeader, Card, Badge, EmptyState, ConfirmDialog, Button } from '../ui';

export default function Media({ ctx }) {
  const { products, updateProduct, notify } = ctx;
  const [filter, setFilter] = useState('all'); // all | issues | noimages
  const [confirmDelete, setConfirmDelete] = useState(null); // {productId, index}

  // Build image list from real products
  const allImages = [];
  products.forEach((p) => {
    (p.images || []).forEach((src, idx) => {
      allImages.push({ productId: p.id, productName: p.name, src, idx, isMain: idx === 0, hasAlt: Boolean(p.altText) || idx !== 0 });
    });
  });

  const missingImages = products.filter((p) => !p.images || p.images.length === 0);
  const noAltProducts = products.filter((p) => p.images?.length && !p.altText);

  let list = allImages;
  if (filter === 'issues') list = allImages.filter((i) => i.isMain && !i.hasAlt);
  if (filter === 'noimages') {
    return (
      <div>
        <SectionHeader title="إدارة الوسائط" subtitle="فحص وتحسين صور الموقع" icon={ImageIcon} />
        <Card>
          <CardHeader title="منتجات بدون صور" icon={ImageIcon} />
          <EmptyState icon={ImageIcon} title="لا توجد منتجات بدون صور حالياً" hint="جميع المنتجات تحتوي على صور."
            action={missingImages.length ? <Button variant="primary" onClick={() => ctx.navigate('products')}>الانتقال للمنتجات</Button> : null} />
        </Card>
      </div>
    );
  }

  const removeImage = () => {
    const { productId, index } = confirmDelete;
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const images = p.images.filter((_, i) => i !== index);
    updateProduct({ ...p, images });
    notify('تم حذف الصورة');
    setConfirmDelete(null);
  };

  const setMain = (productId, index) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const imgs = [...p.images];
    const [item] = imgs.splice(index, 1);
    imgs.unshift(item);
    updateProduct({ ...p, images: imgs });
    notify('تم تعيين الصورة الرئيسية');
  };

  const [preview, setPreview] = useState(null);

  return (
    <div>
      <SectionHeader title="إدارة الوسائط" subtitle={`${allImages.length} صورة عبر ${products.length} منتج`} icon={ImageIcon}
        action={
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'dark' : 'outline'} onClick={() => setFilter('all')}>الكل ({allImages.length})</Button>
            <Button variant={filter === 'issues' ? 'dark' : 'outline'} onClick={() => setFilter('issues')}>مشاكل ({noAltProducts.length})</Button>
            <Button variant={filter === 'noimages' ? 'dark' : 'outline'} onClick={() => setFilter('noimages')}>بدون صور ({missingImages.length})</Button>
          </div>
        } />

      {/* Warnings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Card className="p-4 flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="w-5 h-5" /></span>
          <div><p className="text-xs font-black text-slate-700">منتجات بدون صور</p><p className="text-xl font-black text-rose-600">{missingImages.length}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle className="w-5 h-5" /></span>
          <div><p className="text-xs font-black text-slate-700">بدون Alt text</p><p className="text-xl font-black text-amber-600">{noAltProducts.length}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ImageIcon className="w-5 h-5" /></span>
          <div><p className="text-xs font-black text-slate-700">إجمالي الصور</p><p className="text-xl font-black text-emerald-600">{allImages.length}</p></div>
        </Card>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {list.length === 0 && (
          <div className="col-span-full"><EmptyState icon={ImageIcon} title="لا توجد صور مطابقة" hint="جرّب تغيير الفلتر" /></div>
        )}
        {list.map((img, i) => (
          <div key={i} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={img.src} alt="" loading="lazy" onClick={() => setPreview(img)} className="w-full h-32 object-cover cursor-pointer" />
            {img.isMain && <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">رئيسية</span>}
            {img.isMain && !img.hasAlt && <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">بدون Alt</span>}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              {!img.isMain && <button onClick={() => setMain(img.productId, img.idx)} className="p-1.5 bg-white text-emerald-600 rounded-lg cursor-pointer" title="تعيين رئيسية"><Star className="w-4 h-4" /></button>}
              <button onClick={() => setConfirmDelete({ productId: img.productId, index: img.idx })} className="p-1.5 bg-white text-rose-600 rounded-lg cursor-pointer" title="حذف"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="p-1.5 text-[10px] text-slate-500 truncate font-bold bg-white">{img.productName}</div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-4" onClick={(e) => e.stopPropagation()}>
            <img src={preview.src} alt="" className="w-full h-64 object-contain rounded-xl bg-slate-50" />
            <div className="mt-3 space-y-1 text-xs">
              <p className="font-black text-slate-800">{preview.productName}</p>
              <p className="text-slate-400 font-mono break-all" dir="ltr">{preview.src}</p>
              <div className="flex gap-2 mt-2">
                {preview.isMain ? <Badge tone="green">الصورة الرئيسية</Badge> : <Badge tone="slate">صورة عرض</Badge>}
                {preview.hasAlt ? <Badge tone="green">لها Alt</Badge> : <Badge tone="amber">بدون Alt</Badge>}
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => { window.open(preview.src, '_blank'); }}><Download className="w-4 h-4" /> فتح</Button>
              <Button onClick={() => setPreview(null)}>إغلاق</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} title="حذف الصورة" message="هل أنت متأكد من حذف هذه الصورة من المنتج؟" danger onCancel={() => setConfirmDelete(null)} onConfirm={removeImage} />
    </div>
  );
}
