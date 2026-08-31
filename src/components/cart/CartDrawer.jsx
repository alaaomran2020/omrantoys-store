import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, Truck, Package, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getAllGovernorates } from '../../lib/shippingCalculator';

export default function CartDrawer() {
  const {
    isCartOpen, setIsCartOpen, cart, totalItemsCount, removeFromCart, updateQuantity,
    cartSubtotal, freeShippingThreshold, isFreeShipping, shippingCost, discountAmount, vatAmount, cartTotal,
    appliedCoupon, applyCouponCode, removeCoupon, clearCart, setIsCheckoutOpen, formatPrice,
    shippingCalculation, selectedGovernorate, setSelectedGovernorate
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const remainingForFree = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const governorates = getAllGovernorates();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (applyCouponCode(couponInput)) setCouponInput('');
  };

  const handleProceed = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-toy-red/10 text-toy-red rounded-xl"><ShoppingBag className="w-5 h-5" /></div>
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  سلة التسوق
                </h2>
                <span className="text-xs text-slate-400">{totalItemsCount} قطعة • {formatPrice(cartSubtotal)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {cart.length > 0 && <button onClick={clearCart} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"><Trash2 className="w-4 h-4" /></button>}
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Shipping Governorate Selector */}
          <div className="p-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2"><MapPin className="w-4 h-4 text-toy-red" /> احسب الشحن حسب المحافظة</div>
            <select value={selectedGovernorate} onChange={(e) => setSelectedGovernorate(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-toy-red/20 cursor-pointer">
              {governorates.map(g => <option key={g.value} value={g.value}>{g.label} - {g.base} ج.م ({g.days}) - {g.region}</option>)}
            </select>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>المنطقة: {shippingCalculation.region}</span>
              <span>المدة: {shippingCalculation.estimatedDays}</span>
              <span>الوزن: {(shippingCalculation.breakdown?.totalWeightGrams || 0)} جم</span>
            </div>
          </div>

          {/* Free Shipping Meter */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <div className="flex items-center gap-1.5 text-amber-900">
                <Truck className="w-4 h-4 text-amber-600" />
                {isFreeShipping ? <span className="text-emerald-700">مبروك! شحن مجاني 🚚🎉</span> : <span>أضف {formatPrice(remainingForFree)} للشحن المجاني</span>}
              </div>
              <span className="text-slate-500 font-mono text-[11px]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} style={{ width: `${progressPercent}%` }} /></div>
            {shippingCalculation.breakdown && !isFreeShipping && (
              <div className="mt-2 text-[10px] text-amber-800 bg-white/60 p-2 rounded-lg border border-amber-200">
                أساسي {shippingCalculation.breakdown.base} ج.م + وزن إضافي {shippingCalculation.breakdown.extraWeight || 0} ج.م {shippingCalculation.breakdown.volumeExtra ? `+ حجم ${shippingCalculation.breakdown.volumeExtra} ج.م` : ''}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
            {cart.length > 0 ? cart.map((item) => (
              <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3.5 group">
                <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-100 bg-slate-50 shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 leading-snug">{item.product.name}</h4>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-toy-red">{formatPrice(item.product.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded-lg cursor-pointer"><Minus className="w-3 h-3" /></button>
                      <span className="w-7 text-center font-bold text-xs text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.product.stock > 0 && item.quantity >= item.product.stock} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded-lg cursor-pointer disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-4"><ShoppingBag className="w-10 h-10" /></div>
                <h3 className="text-base font-bold text-slate-800 mb-1">السلة فارغة</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">استكشف ألعاب عمران واملأ سلتك!</p>
                <button onClick={() => setIsCartOpen(false)} className="bg-slate-900 hover:bg-toy-red text-white text-xs font-bold px-6 py-3 rounded-2xl cursor-pointer shadow-md">تصفح الألعاب</button>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 bg-white space-y-3.5 shadow-2xl">
              {appliedCoupon ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs text-emerald-800"><div className="flex items-center gap-2 font-bold"><Tag className="w-4 h-4 text-emerald-600" /><span>كوبون: {appliedCoupon.code}</span></div><button onClick={removeCoupon} className="text-xs text-rose-600 hover:underline font-bold cursor-pointer">إلغاء</button></div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2"><div className="relative flex-1"><input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="كود الخصم" className="w-full uppercase text-xs font-bold pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-toy-red/20" /><Tag className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" /></div><button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shrink-0">تطبيق</button></form>
              )}

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between"><span>المجموع الفرعي:</span><span className="font-bold text-slate-900">{formatPrice(cartSubtotal)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><span>خصم:</span><span>- {formatPrice(discountAmount)}</span></div>}
                <div className="flex justify-between"><span>الشحن ({shippingCalculation.zone}):</span>{shippingCost === 0 ? <span className="font-bold text-emerald-600">مجاني 🎉</span> : <span className="font-bold text-slate-900">{formatPrice(shippingCost)}</span>}</div>
                <div className="flex justify-between text-[11px] text-slate-400"><span>VAT 14% مشمولة:</span><span>{formatPrice(vatAmount)}</span></div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline"><span className="font-black text-sm text-slate-900">الإجمالي:</span><span className="text-xl font-black text-toy-red">{formatPrice(cartTotal)}</span></div>
              </div>

              <button onClick={handleProceed} className="w-full bg-toy-red hover:bg-rose-600 text-white font-black py-3.5 px-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-toy-red/25 cursor-pointer hover:scale-[1.02]"><span>متابعة لإتمام الطلب</span><ArrowLeft className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
