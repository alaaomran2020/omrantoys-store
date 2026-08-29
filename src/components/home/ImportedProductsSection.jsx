import { ExternalLink, ImagePlus, MessageCircle } from 'lucide-react';

const importedProducts = [
  {
    id: 'ig-kitchen-46',
    name: 'مطبخ ألعاب للأطفال — 46 قطعة',
    description: 'مطبخ أطفال كامل مع أدوات وأوانٍ وإكسسوارات للعب التخيلي، مناسب للبنات والأولاد.',
    image: '/imported/omran-product-01.png',
    source: 'https://www.instagram.com/p/DcTpYZ7kUhj/'
  },
  {
    id: 'ig-squishy',
    name: 'لعبة الاسكوشي بأشكال وألوان متنوعة',
    description: 'لعبة ناعمة وممتعة للتسلية، مناسبة للهدايا وللأطفال والكبار.',
    image: '/imported/omran-product-02.png',
    source: 'https://www.instagram.com/p/DcTpNfUFHiJ/'
  },
  {
    id: 'ig-home-chef-104',
    name: 'مطبخ Home Chef للأطفال — 104 قطعة',
    description: 'تجربة لعب واقعية مع إضاءة وأصوات وملحقات متنوعة، مناسب من عمر 3 سنوات.',
    image: '/imported/omran-product-03.png',
    source: 'https://www.instagram.com/p/DcTpBu2lOt8/'
  }
];

const whatsappFor = (name) => `https://wa.me/201555570269?text=${encodeURIComponent(`مرحبًا، أريد معرفة سعر وتفاصيل منتج: ${name}`)}`;

export default function ImportedProductsSection() {
  return (
    <section id="instagram-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
            <ImagePlus className="h-4 w-4" /> منتجات جديدة من Omran Toys
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">منتجات وصلت حديثًا</h2>
          <p className="mt-1 text-sm text-slate-500">صور حقيقية محسّنة من محتوى المتجر، والسعر متاح مباشرة عبر WhatsApp.</p>
        </div>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:self-auto">
          <ExternalLink className="h-4 w-4" /> شاهد المزيد على Instagram
        </a>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {importedProducts.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="relative aspect-square overflow-hidden bg-[#faf8f5]">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-violet-700 shadow-sm">مستورد من منشور المتجر</span>
            </div>
            <div className="p-5 text-right">
              <h3 className="text-base font-black leading-7 text-slate-900">{product.name}</h3>
              <p className="mt-2 min-h-12 text-xs leading-6 text-slate-500">{product.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className="text-sm font-black text-toy-red">السعر عبر WhatsApp</span>
                <a href={whatsappFor(product.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-black text-white hover:bg-[#1ebe5d]">
                  <MessageCircle className="h-4 w-4" /> اسأل عن السعر
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
