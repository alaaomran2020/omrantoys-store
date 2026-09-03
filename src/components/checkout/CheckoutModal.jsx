import React, { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard, User, ArrowLeft, ExternalLink, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { getAllGovernorates } from '../../lib/shippingCalculator';
import { PAYMENT_METHODS, calculatePaymentFees, validatePaymentAmount, initiatePaymobPayment, initiateFawryPayment } from '../../lib/paymentGateways';

const WHATSAPP_NUMBER = '201555570269';

export default function CheckoutModal() {
  const {
    isCheckoutOpen, setIsCheckoutOpen, cart, cartSubtotal, shippingCost, cartTotal,
    formatPrice, placeOrder, lastPlacedOrder, setLastPlacedOrder, shippingCalculation, selectedGovernorate, setSelectedGovernorate
  } = useStore();

  const auth = useAuth();

  const [fullName, setFullName] = useState(auth.customer?.fullName || '');
  const [phone, setPhone] = useState(auth.customer?.phone ? `0${auth.customer.phone.slice(2)}` : '');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(selectedGovernorate || 'طنطا (الغربية)');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paymob');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fawryCode, setFawryCode] = useState(null);

  // تعبئة بيانات العميل المسجلة تلقائياً عند فتح الشاشة
  useEffect(() => {
    if (auth.customer) {
      setFullName(auth.customer.fullName || '');
      setPhone(auth.customer.phone ? `0${auth.customer.phone.slice(2)}` : '');
    }
  }, [auth.customer]);

  if (!isCheckoutOpen) return null;

  const governorates = getAllGovernorates();
  const paymentFee = calculatePaymentFees(paymentMethod, cartTotal);
  const totalWithFee = cartTotal + paymentFee;
  const validation = validatePaymentAmount(totalWithFee, paymentMethod);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsProcessing(true);

    try {
      // Payment gateway integration
      if (paymentMethod === 'paymob') {
        const payRes = await initiatePaymobPayment({ amount: totalWithFee, orderId: `OMR-${Date.now()}`, customer: { name: fullName, phone, email }, billingData: { city, address } });
        if (!payRes.success) throw new Error(payRes.error);
      } else if (paymentMethod === 'fawry') {
        const fawRes = await initiateFawryPayment({ amount: totalWithFee, orderId: `OMR-${Date.now()}`, customer: { name: fullName, phone } });
        if (fawRes.success && fawRes.fawryCode) setFawryCode(fawRes.fawryCode);
      }

      setTimeout(() => {
        placeOrder({
          customerName: fullName,
          phone,
          email,
          city,
          governorate: city,
          address,
          paymentMethod: PAYMENT_METHODS[paymentMethod.toUpperCase()]?.name || paymentMethod,
          payment_gateway: paymentMethod,
          payment_fee: paymentFee,
          user_type: 'retail',
        });
        setIsProcessing(false);
        try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); } catch {}
      }, 800);
    } catch (err) {
      setIsProcessing(false);
      alert('حدث خطأ في الدفع: ' + err.message);
    }
  };

  const handleWhatsApp = (orderId) => {
    const text = encodeURIComponent(`مرحباً عمران، طلب #${orderId} - قطاعي - أود التأكيد`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  const closeCheckout = () => { setIsCheckoutOpen(false); setLastPlacedOrder(null); setFawryCode(null); };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] sm:max-h-[94vh] flex flex-col">
        
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-toy-red/10 text-toy-red flex items-center justify-center font-black">🛍️</div>
            <div>
              <h2 className="text-base font-black text-slate-900">{lastPlacedOrder ? 'تم تأكيد طلبك!' : `إتمام الطلب - ${formatPrice(totalWithFee)}`}</h2>
              <span className="text-[11px] text-slate-400">{shippingCalculation.zone} • {shippingCalculation.estimatedDays} • وزن {shippingCalculation.breakdown?.totalWeightGrams || 0}جم</span>
            </div>
          </div>
          <button onClick={closeCheckout} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 sm:px-8">
          {lastPlacedOrder ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce-slow"><CheckCircle className="w-12 h-12" /></div>
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">طلب مؤكد وجاري التجهيز</span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">مبروك! تم استلام طلبك 🎉</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">أهلاً {lastPlacedOrder.customerName}، نجهز ألعابك الآن!</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-right space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-bold"><span className="text-slate-500">رقم الطلب:</span><span className="font-mono text-toy-red text-sm font-black">#{lastPlacedOrder.id}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-slate-500">المحافظة:</span><span className="font-bold">{lastPlacedOrder.city}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-slate-500">الدفع:</span><span className="font-bold">{lastPlacedOrder.paymentMethod}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-slate-500">عدد الألعاب:</span><span className="font-bold">{lastPlacedOrder.items.length} لعبة</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-slate-500">الشحن:</span><span className="font-bold">{formatPrice(lastPlacedOrder.shipping)} - {lastPlacedOrder.estimated_delivery}</span></div>
                {fawryCode && <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs"><strong>كود فوري:</strong> <span className="font-mono font-black text-lg">{fawryCode}</span><div className="text-[11px] text-amber-700 mt-1">ادفع خلال 24 ساعة من أي ماكينة فوري</div></div>}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-sm"><span className="font-black">الإجمالي:</span><span className="font-black text-base text-toy-red">{formatPrice(lastPlacedOrder.total + (lastPlacedOrder.payment_fee || 0))}</span></div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button onClick={() => handleWhatsApp(lastPlacedOrder.id)} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"><span>تأكيد عبر واتساب</span><ExternalLink className="w-4 h-4" /></button>
                <button onClick={() => window.print()} className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"><Printer className="w-4 h-4" /><span>طباعة الفاتورة</span></button>
                <button onClick={closeCheckout} className="w-full sm:w-auto bg-slate-900 hover:bg-toy-red text-white font-bold text-xs px-5 py-3 rounded-xl cursor-pointer">متابعة التسوق</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100"><User className="w-4 h-4 text-toy-red" /><span>1. بيانات المستلم</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">الاسم *</label><input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="أحمد محمود" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">الموبايل *</label><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20 text-left font-mono" dir="ltr" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة *</label>
                    <select value={city} onChange={(e) => { setCity(e.target.value); setSelectedGovernorate(e.target.value); }} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-toy-red/20 cursor-pointer">
                      {governorates.map(g => <option key={g.value} value={g.value}>{g.label} - {g.base} ج.م ({g.days})</option>)}
                    </select>
                    <div className="text-[11px] text-slate-500 mt-1">المنطقة: {shippingCalculation.region} • المدة: {shippingCalculation.estimatedDays} • تكلفة: {formatPrice(shippingCalculation.cost)}</div>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">البريد (اختياري)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20" /></div>
                </div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">العنوان التفصيلي *</label><input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="المنطقة، الشارع، رقم العمارة" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20" /></div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100"><CreditCard className="w-4 h-4 text-toy-blue" /><span>2. طريقة الدفع</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(PAYMENT_METHODS).map(method => (
                    <label key={method.id} className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-toy-red bg-rose-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="text-toy-red" />
                      <div className="flex-1">
                        <span className="font-bold text-xs block text-slate-900 flex items-center gap-2"><span>{method.icon}</span><span>{method.name}</span>{method.fees > 0 && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">+{method.fees} ج.م</span>}</span>
                        <span className="text-[11px] text-slate-500">{method.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {!validation.valid && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">{validation.error}</div>}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-700 mb-2">ملخص الحساب:</h4>
                <div className="flex justify-between text-xs text-slate-600"><span>قيمة الألعاب ({cart.length}):</span><span className="font-bold text-slate-900">{formatPrice(cartSubtotal)}</span></div>
                <div className="flex justify-between text-xs text-slate-600"><span>الشحن ({shippingCalculation.zone}):</span><span>{shippingCost === 0 ? 'مجاني 🎉' : formatPrice(shippingCost)}</span></div>
                {paymentFee > 0 && <div className="flex justify-between text-xs text-slate-600"><span>رسوم {PAYMENT_METHODS[paymentMethod.toUpperCase()]?.name}:</span><span>{formatPrice(paymentFee)}</span></div>}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline"><span className="font-black text-sm text-slate-900">الإجمالي المستحق:</span><span className="text-xl font-black text-toy-red">{formatPrice(totalWithFee)}</span></div>
                <div className="text-[11px] text-slate-400">الوزن: {shippingCalculation.breakdown?.totalWeightGrams || 0} جم • المدة: {shippingCalculation.estimatedDays}</div>
              </div>

              <button type="submit" disabled={isProcessing || !validation.valid} className="w-full bg-toy-red hover:bg-rose-600 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-toy-red/25 cursor-pointer hover:scale-[1.01]">
                {isProcessing ? <span>جاري التأكيد... ⏳</span> : <><span>تأكيد الطلب ({formatPrice(totalWithFee)})</span><ArrowLeft className="w-5 h-5" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
