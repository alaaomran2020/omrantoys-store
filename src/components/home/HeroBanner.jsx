import React from 'react';
import { ArrowLeft, Gift, LayoutGrid, Coins } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function HeroBanner() {
  const { products, formatPrice, getEffectivePrice, getProductCapabilities, setSelectedProductModal } = useStore();
  const featured = products.filter(product => product.images?.[0] && getProductCapabilities(product).availability !== 'out_of_stock').slice(0, 3);

  return (
    <section className="omran-hero" aria-labelledby="hero-title">
      <div className="omran-hero-inner">
        <div className="omran-hero-copy">
          <span className="omran-eyebrow"><span aria-hidden="true" /> عالم عمران للألعاب</span>
          <h1 id="hero-title">لحظات صغيرة.<br /><span>فرحة كبيرة.</span></h1>
          <p className="omran-hero-description">من أول لعبة لحد أجمل حفلة، اكتشف ألعاب الأطفال ومستلزمات الاحتفال، واختار اللي يكمّل فرحتهم.</p>
          <a href="#products-section" className="omran-primary-cta">اكتشف الألعاب <ArrowLeft size={20} aria-hidden="true" /></a>
          <div className="omran-hero-details">
            <span><Gift size={18} aria-hidden="true" /> ألعاب ومستلزمات حفلات</span>
            <span><Coins size={18} aria-hidden="true" /> الأسعار بالجنيه المصري</span>
          </div>
        </div>
        <div className="omran-showcase">
          <div className="omran-showcase-heading"><span>من عالم اللعب</span><span lang="en" dir="ltr">OMRAN / PLAY & DISCOVER</span></div>
          {featured.length > 0 ? (
            <div className="omran-showcase-grid">
              {featured.map((product, index) => (
                <button key={product.id} onClick={() => setSelectedProductModal(product)} className={`omran-hero-product ${index === 0 ? 'omran-hero-product-main' : ''}`} aria-label={`عرض ${product.name}`}>
                  <div className="omran-product-stage"><img src={product.images[0]} alt={product.name} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" /></div>
                  <div className="omran-hero-product-info"><div><h2>{product.name}</h2><p>{getProductCapabilities(product).priceKnown ? formatPrice(getEffectivePrice(product)) : 'استفسر عن السعر'}</p></div><ArrowLeft size={20} aria-hidden="true" /></div>
                </button>
              ))}
            </div>
          ) : (
            <a href="#products-section" className="omran-showcase-empty"><LayoutGrid size={48} aria-hidden="true" /><span>اكتشف عالم الألعاب</span><span>تصفح كتالوج عمران <ArrowLeft size={18} aria-hidden="true" /></span></a>
          )}
          <div className="omran-showcase-footer"><span>مساحة للخيال. وقت للمرح.</span><span aria-hidden="true">✦</span></div>
        </div>
      </div>
    </section>
  );
}
