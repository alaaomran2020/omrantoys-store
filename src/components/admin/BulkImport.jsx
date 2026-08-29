import React, { useState } from 'react';
import { Upload, FileJson, CheckCircle, AlertTriangle, Download, Trash2, Plus } from 'lucide-react';

export default function BulkImport({ onImport, existingProducts }) {
  const [jsonInput, setJsonInput] = useState('');
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [successCount, setSuccessCount] = useState(0);

  const sampleTemplate = [
    {
      name: 'بالون هيليوم - باقة 50 قطعة',
      nameEn: 'Helium Balloons 50pcs',
      category: 'balloons',
      price: 350,
      wholesale_price: 250,
      stock: 100,
      ageGroup: '3-5',
      brand: 'Omran Party',
      description: 'بالونات هيليوم ملونة للاحتفالات',
      toy_type: 'balloon',
      weight_grams: 800,
      is_party_supply: true
    }
  ];

  const handleParse = () => {
    setErrors([]);
    setPreview([]);
    try {
      const data = JSON.parse(jsonInput);
      const arr = Array.isArray(data) ? data : [data];
      const valid = [];
      const errs = [];
      arr.forEach((item, idx) => {
        if (!item.name || !item.price) {
          errs.push(`المنتج ${idx + 1}: يجب توفير name و price`);
        } else {
          valid.push({
            id: Date.now() + idx,
            sku: item.sku || `OMR-BULK-${Date.now()}-${idx}`,
            name: item.name,
            nameEn: item.nameEn || item.name,
            category: item.category || 'party',
            price: Number(item.price),
            wholesale_price: item.wholesale_price ? Number(item.wholesale_price) : Math.round(Number(item.price) * 0.75),
            wholesale_price_tier2: item.wholesale_price_tier2 ? Number(item.wholesale_price_tier2) : Math.round(Number(item.price) * 0.7),
            originalPrice: item.originalPrice || item.price,
            discountPercent: item.discountPercent || 0,
            stock: Number(item.stock || 20),
            ageGroup: item.ageGroup || '3-5',
            brand: item.brand || 'Omran Toys',
            description: item.description || 'منتج جديد',
            images: item.images || ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80'],
            tags: item.tags || [],
            rating: 0,
            reviewsCount: 0,
            isNew: true,
            isBestSeller: false,
            isFeatured: false,
            is_party_supply: item.category === 'party' || item.category === 'balloons',
            is_balloon: item.category === 'balloons',
            weight_grams: item.weight_grams || 500,
            toy_type: item.toy_type || item.category,
            import_batch_id: `batch_${Date.now()}`,
          });
        }
      });
      setPreview(valid);
      setErrors(errs);
    } catch (e) {
      setErrors(['JSON غير صالح: ' + e.message]);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) return;
    onImport?.(preview);
    setSuccessCount(preview.length);
    setPreview([]);
    setJsonInput('');
    setTimeout(() => setSuccessCount(0), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonInput(ev.target.result);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omran_bulk_template.json';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-toy-red" />
          استيراد منتجات بالجملة (Bulk Import)
        </h3>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs font-bold text-toy-blue hover:underline cursor-pointer">
          <Download className="w-3.5 h-3.5" />
          تحميل نموذج JSON
        </button>
      </div>

      {successCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle className="w-4 h-4" />
          تم استيراد {successCount} منتج بنجاح!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800">
              <FileJson className="w-4 h-4" />
              رفع ملف JSON
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-[11px] text-slate-400">أو الصق JSON مباشرة</span>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`[\n  {\n    "name": "بالونات عيد ميلاد 100 قطعة",\n    "price": 250,\n    "wholesale_price": 180,\n    "category": "balloons",\n    "stock": 200\n  }\n]`}
            className="w-full h-64 p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-toy-red/30 resize-none"
            dir="ltr"
          />

          <div className="flex gap-2">
            <button onClick={handleParse} className="flex-1 bg-toy-blue hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
              <FileJson className="w-4 h-4" />
              معاينة البيانات
            </button>
            <button onClick={() => { setJsonInput(''); setPreview([]); setErrors([]); }} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
              مسح
            </button>
          </div>

          {errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
              {errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-rose-700 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {err}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-700">معاينة ({preview.length} منتج)</h4>
            {preview.length > 0 && (
              <button onClick={handleImport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                استيراد {preview.length}
              </button>
            )}
          </div>

          {preview.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">الصق JSON واضغط معاينة</p>
              <p className="text-[11px] mt-1">يدعم حتى 500 منتج مرة واحدة</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {preview.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.category} • {p.stock} قطعة • {p.price} ج.م (جملة {p.wholesale_price} ج.م)</div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${p.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{p.stock === 0 ? 'نفد' : 'متوفر'}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <h5 className="font-bold text-[11px] text-blue-900">الحقول المدعومة:</h5>
            <p className="text-[10px] text-blue-700 mt-1 leading-relaxed font-mono" dir="ltr">
              name, price, wholesale_price, category, stock, brand, description, ageGroup, weight_grams, images[], tags[]
            </p>
            <p className="text-[10px] text-blue-600 mt-2">الفئات: educational, building, rc-electronic, dolls-figures, party, balloons, outdoor, infant, arts-crafts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
