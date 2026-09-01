import React from 'react';
import { Upload, ShieldAlert } from 'lucide-react';
import { SectionHeader, Card } from '../ui';
import BulkImport from '../BulkImport';

export default function Import({ ctx }) {
  const { products, bulkImportProducts } = ctx;
  return (
    <div>
      <SectionHeader title="استيراد البيانات" subtitle="استيراد المنتجات من CSV/JSON مع معاينة وفحص" icon={Upload} />

      <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="leading-5">يتم دعم الاستيراد عبر معاينة وتأكيد قبل الإضافة — لا يُضاف أي منتج مباشرة إلى المتجر إلا بعد الضغط على "استيراد". كشف التكرار يتم بمقارنة SKU مع المنتجات الحالية.</p>
      </div>

      <Card className="p-4">
        <BulkImport onImport={(items) => {
          // Detect duplicates by SKU against existing
          const existingSkus = new Set(products.map((p) => p.sku).filter(Boolean));
          const existingNames = new Set(products.map((p) => p.name));
          const fresh = items.filter((i) => !existingSkus.has(i.sku) && !existingNames.has(i.name));
          if (fresh.length !== items.length) {
            ctx.notify(`تجاهل ${items.length - fresh.length} منتجاً مكرراً (SKU أو اسم مطابق)`, 'info');
          }
          if (fresh.length) bulkImportProducts(fresh);
        }} existingProducts={products} />
      </Card>
    </div>
  );
}
