import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Gift, 
  Check, 
  Info, 
  Battery, 
  Ruler, 
  Share2, 
  MessageSquarePlus,
  Flame
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function ProductDetailModal() {
  const {
    selectedProductModal,
    setSelectedProductModal,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    reviews,
    addReview,
    products,
    setIsCheckoutOpen
  } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'

  // New review form
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  if (!selectedProductModal) return null;

  const product = selectedProductModal;
  const isFavorite = isInWishlist(product.id);

  // Product reviews
  const productReviews = reviews.filter(r => r.productId === product.id);

  // Related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity, { giftWrap: isGiftWrapped });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, { giftWrap: isGiftWrapped });
    setSelectedProductModal(null);
    setIsCheckoutOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;
    addReview(product.id, {
      author: newReviewAuthor,
      rating: newReviewRating,
      comment: newReviewComment
    });
    setNewReviewAuthor('');
    setNewReviewComment('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `شاهد هذه اللعبة الرائعة على متجر عمران للألعاب: ${product.name}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط المنتج بنجاح!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header bar with close button */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">كود المنتج:</span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
              {product.sku}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="مشاركة المنتج"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedProductModal(null)}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 sm:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Gallery Column (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              {/* Main Photo */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all"
                />
                {product.discountPercent > 0 && (
                  <div className="absolute top-3 right-3 bg-toy-red text-white text-xs font-black px-2.5 py-1 rounded-xl shadow">
                    خصم {product.discountPercent}%
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-toy-red scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="صورة مصغرة" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Badges strip */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{product.safetyNotice || 'معتمد 100% للأطفال ومطابق لمعايير السلامة'}</span>
              </div>
            </div>

            {/* Info & Options Column (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Brand & Age */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-toy-blue bg-blue-50 px-2.5 py-1 rounded-lg">
                  {product.brand}
                </span>
                <span className="text-xs font-black bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                  مناسب لعمر: 🎯 {product.ageGroup} سنوات
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 fill-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} تقييم موثق)</span>
                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                  متوفر في المخزون ({product.stock} قطعة)
                </span>
              </div>

              {/* Price */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">السعر شامل الضريبة:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left text-xs font-medium text-slate-500">
                  <span>أو 4 دفعات بقيمة </span>
                  <strong className="text-slate-900 font-black">
                    {formatPrice(Math.round(product.price / 4))}
                  </strong>
                  <span> عبر تابي أو تمارا</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-bold text-slate-700">المميزات الرئيسية:</h4>
                  <ul className="space-y-1">
                    {product.features.map((feat, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-toy-green shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
                {product.dimensions && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <Ruler className="w-4 h-4 text-toy-purple" />
                    <span>الأبعاد: {product.dimensions}</span>
                  </div>
                )}
                {product.batteryRequired && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <Battery className="w-4 h-4 text-toy-red" />
                    <span>البطارية: {product.batteryRequired}</span>
                  </div>
                )}
              </div>

              {/* Gift Wrapping Toggle */}
              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Gift className="w-5 h-5 text-toy-red shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">
                      هل تود تغليف اللعبة كهدية فاخرة؟
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      تغليف أنيق مع كرت إهداء مجاني
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isGiftWrapped}
                  onChange={(e) => setIsGiftWrapped(e.target.checked)}
                  className="w-5 h-5 rounded text-toy-red focus:ring-toy-red cursor-pointer"
                />
              </div>

              {/* Quantity and Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-200 rounded-2xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 w-full bg-slate-900 hover:bg-toy-red text-white font-black py-3 px-5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>إضافة إلى السلة ({formatPrice(product.price * quantity)})</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:w-auto bg-gradient-to-r from-toy-red to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-2xl text-sm transition-all shadow-md cursor-pointer"
                >
                  شراء فوري
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-50 border-rose-200 text-toy-red'
                      : 'border-slate-200 text-slate-500 hover:text-toy-red hover:bg-slate-50'
                  }`}
                  title="المفضلة"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-toy-red' : ''}`} />
                </button>
              </div>

            </div>

          </div>

          {/* Tabs Section: Reviews & Related */}
          <div className="pt-8 border-t border-slate-100">
            <div className="flex gap-4 border-b border-slate-100 pb-3">
              <button
                onClick={() => setActiveTab('details')}
                className={`text-sm font-bold pb-2 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'details'
                    ? 'text-toy-red border-toy-red'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                تقييمات وآراء العملاء ({productReviews.length})
              </button>
            </div>

            {/* Reviews Tab Content */}
            <div className="pt-4 space-y-6">
              
              {/* Existing Reviews List */}
              <div className="space-y-3">
                {productReviews.length > 0 ? (
                  productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">{rev.author}</span>
                          {rev.verified && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              مشتري مؤكد ✓
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    لا توجد تقييمات حتى الآن. كن أول من يشارك رأيه حول هذه اللعبة!
                  </p>
                )}
              </div>

              {/* Add New Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-toy-red" />
                  <span>أضف تقييمك وتجربتك</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="اسمك الكريم (مثال: أم نورة أو أبو خالد)"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-toy-red/20"
                  />

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 rounded-xl border border-slate-200">
                    <span>تقييمك:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= newReviewRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea
                  required
                  rows="3"
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="اكتب انطباعك عن جودة اللعبة وفرحة طفلك بها..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-toy-red/20"
                />

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-toy-red text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  إرسال التقييم
                </button>
              </form>

            </div>
          </div>

          {/* Related Toys Section */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="font-bold text-sm text-slate-900 mb-3">
                ألعاب مشابهة قد تعجب طفلك 🎈
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedProductModal(rel);
                      setSelectedImageIndex(0);
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={rel.images[0]}
                      alt={rel.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-800 truncate">{rel.name}</h5>
                      <span className="text-xs font-black text-toy-red block mt-0.5">
                        {formatPrice(rel.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
