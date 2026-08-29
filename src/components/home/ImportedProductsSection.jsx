import { ExternalLink, ImagePlus, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

// أسعار مؤقتة للمراجعة والتعديل لاحقًا من مصدر المنتجات أو لوحة الإدارة.
const importedProducts = [
  {
    id: 1001,
    name: 'مطبخ ألعاب للأطفال — 46 قطعة',
    description: 'مطبخ أطفال كامل بأدوات وأواني وإكسسوارات كتير للعب التخيلي. مناسب للبنات والأولاد.',
    image: '/imported/omran-product-01.png',
    price: 850,
    stock: 12,
    source: 'https://www.instagram.com/p/DcTpYZ7kUhj/'
  },
  {
    id: 1002,
    name: 'لعبة الاسكوشي بأشكال وألوان متنوعة',
    description: 'لعبة ناعمة ولطيفة للتسلية وتفريغ الطاقة، تنفع كهدية حلوة للأطفال والكبار.',
    image: '/imported/omran-product-02.png',
    price: 275,
    stock: 30,
    source: 'https://www.instagram.com/p/DcTpNfUFHiJ/'
  },
  {
    id: 1003,
    name: 'مطبخ Home Chef للأطفال — 104 قطعة',
    description: 'مطبخ لعب واقعي جدًا بإضاءة وأصوات وملحقات كتير، مناسب للأطفال من 3 سنين.',
    image: '/imported/omran-product-03.png',
    price: 1850,
    stock: 8,
    source: 'https://www.instagram.com/p/DcTpBu2lOt8/'
  }
];

export default function ImportedProductsSection() {
  const { addToCart, setIsCartOpen, formatPrice, showToast } = useStore();

  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
    showToast(`اتضافت «${product.name}» للسلة، يا بختك بالاختيار!`);
  };

  return (
    <section id="instagram-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
            <ImagePlus className="h-4 w-4" /> منتجات جديدة من Omran Toys
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">وصلت جديد وبتخطف العين</h2>
          <p className="mt-1 text-sm text-slate-500">صور حقيقية محسّنة من محتوى المتجر، والأسعار دي مؤقتة لحد ما تراجعها.</p>
        </div>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:self-auto">
          <ExternalLink className="h-4 w-4" /> شوف باقي المنتجات على Instagram
        </a>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {importedProducts.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="relative aspect-square overflow-hidden bg-[#faf8f5]">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-violet-700 shadow-sm">جديد عند عمران</span>
            </div>
            <div className="p-5 text-right">
              <h3 className="text-base font-black leading-7 text-slate-900">{product.name}</h3>
              <p className="mt-2 min-h-12 text-xs leading-6 text-slate-500">{product.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                  <span className="block text-lg font-black text-toy-red">{formatPrice(product.price)}</span>
                  <span className="text-[11px] font-bold text-emerald-600">متوفر حاليًا</span>
                </div>
                <button onClick={() => handleAddToCart(product)} className="inline-flex items-center gap-1.5 rounded-xl bg-toy-red px-3 py-2.5 text-xs font-black text-white hover:bg-red-700">
                  <ShoppingCart className="h-4 w-4" /> اشتري دلوقتي
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
