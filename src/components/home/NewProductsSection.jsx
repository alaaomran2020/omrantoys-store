import React from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../product/ProductCard';

export default function NewProductsSection() {
  const { products } = useStore();

  const newProducts = products.filter(p => p.isNew);

  if (newProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          وصل حديثاً
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
          منتجات جديدة ✨
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          أحدث الإضافات لتشكيلة عمران للألعاب — جربها قبل غيرك!
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
        {newProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
