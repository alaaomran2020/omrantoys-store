import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  CreditCard, 
  Truck, 
  Gift, 
  ShieldCheck, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  User, 
  Mail, 
  ArrowLeft,
  ExternalLink,
  Printer,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    shippingCost,
    discountAmount,
    vatAmount,
    cartTotal,
    formatPrice,
    placeOrder,
    lastPlacedOrder,
    setLastPlacedOrder
  } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('طنطا (الغربية)');
  const [address, setAddress] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('instapay');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const egyptianCities = [
    'طنطا (الغربية)',
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'المحلة الكبرى',
    'المنصورة (الدقهلية)',
    'الزقازيق (الشرقية)',
    'بنها (القليوبية)',
    'دمنهور (البحيرة)',
    'كفر الشيخ',
    'دمياط',
    'بورسعيد',
    'الإسماعيلية',
    'السويس',
    'الفيوم',
    'بني سويف',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'البحر الأحمر (الغردقة)',
    'جنوب سيناء (شرم الشيخ)',
    'مرسى مطروح'
  ];

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة للتوصيل');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const order = placeOrder({
        customerName: fullName,
        phone,
        email,
        city,
        address,
        giftMessage,
        paymentMethod:
          paymentMethod === 'instapay' ? 'إنستاباي / محافظ إلكترونية (فودافون كاش)' :
          paymentMethod === 'card' ? 'كارت ميزة / فيزا / ماستركارد' :
          paymentMethod === 'valu' ? 'فاليو / أمان (تقسيط)' : 'الدفع عند الاستلام (كاش)'
      });

      setIsProcessing(false);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppContact = (orderId) => {
    const text = encodeURIComponent(`مرحباً متجر عمران للألعاب، قمت بالطلب للتو برقم: #${orderId}. أود تأكيد طلبي ومتابعته، شكراً لكم!`);
    window.open(`https://wa.me/201012345678?text=${text}`, '_blank');
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setLastPlacedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-toy-red/10 text-toy-red flex items-center justify-center font-black">
              🛍️
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {lastPlacedOrder ? 'تم تأكيد طلبك بنجاح!' : 'إتمام الطلب والشحن (التعامل بالجنيه المصري)'}
              </h2>
              <span className="text-[11px] text-slate-400">توصيل سريع لكافة محافظات مصر</span>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6 sm:px-8">
          {lastPlacedOrder ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce-slow">
                <CheckCircle className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  طلب مؤكد وجاري التجهيز والتغليف
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  مبروك! تم استلام طلبك بنجاح 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  أهلاً بك يا <strong className="text-slate-800">{lastPlacedOrder.customerName}</strong>، نجهز الآن ألعابك بكل حب وعناية!
                </p>
              </div>

              {/* Order Invoice Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-right space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-bold">
                  <span className="text-slate-500">رقم الطلب:</span>
                  <span className="font-mono text-toy-red text-sm font-black">
                    #{lastPlacedOrder.id}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">المحافظة والمدينة:</span>
                  <span className="font-bold text-slate-800">{lastPlacedOrder.city}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">طريقة الدفع:</span>
                  <span className="font-bold text-slate-800">{lastPlacedOrder.paymentMethod}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">عدد الألعاب:</span>
                  <span className="font-bold text-slate-800">{lastPlacedOrder.items.length} لعبة</span>
                </div>

                {lastPlacedOrder.giftMessage && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">رسالة الإهداء المرفقة:</span>
                    <p className="italic">"{lastPlacedOrder.giftMessage}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-sm">
                  <span className="font-black text-slate-900">المبلغ الإجمالي (شامل الضريبة والشحن):</span>
                  <span className="font-black text-base text-toy-red">
                    {formatPrice(lastPlacedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleWhatsAppContact(lastPlacedOrder.id)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>تأكيد ومتابعة عبر واتساب</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الفاتورة</span>
                </button>

                <button
                  onClick={closeCheckout}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-toy-red text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  متابعة التسوق
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Step 1: Customer Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                  <User className="w-4 h-4 text-toy-red" />
                  <span>1. بيانات المستلم وعنوان التوصيل</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: أحمد محمود"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الموبايل للتوصيل *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20 text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المحافظة / المدينة *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20 cursor-pointer font-semibold"
                    >
                      {egyptianCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني (اختياري)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان التفصيلي (المنطقة، الشارع، رقم العمارة والشقة) *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: طنطا، شارع النحاس، عمارة الأمل الدور الثالث"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-toy-red" />
                    <span>رسالة إهداء مع كرت مجاني باسم الطفل (اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="مثال: كل سنة وأنت طيب يا حبيبنا يوسف بمناسبة عيد ميلادك 🎈"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-toy-red/20"
                  />
                </div>
              </div>

              {/* Step 2: Payment Methods for Egypt */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-toy-blue" />
                  <span>2. طريقة الدفع بالجنيه المصري</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'instapay'
                        ? 'border-toy-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="instapay"
                      checked={paymentMethod === 'instapay'}
                      onChange={() => setPaymentMethod('instapay')}
                      className="text-toy-red"
                    />
                    <div>
                      <span className="font-bold text-xs block text-slate-900 flex items-center gap-1">
                        <span>إنستاباي ومحافظ إلكترونية</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-1 rounded font-normal">InstaPay</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        فودافون كاش، إنستاباي، أورنج، وي باي
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-toy-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-toy-red"
                    />
                    <div>
                      <span className="font-bold text-xs block text-slate-900 flex items-center gap-1">
                        <span>كارت ميزة / فيزا / ماستركارد</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-normal">ميزة</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        دفع فوري آمن عبر أي كارت بنكي مصري
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'valu'
                        ? 'border-toy-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="valu"
                      checked={paymentMethod === 'valu'}
                      onChange={() => setPaymentMethod('valu')}
                      className="text-toy-red"
                    />
                    <div>
                      <span className="font-bold text-xs block text-slate-900">
                        تقسيط عبر فاليو أو أمان (ValU / Aman)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        تقسيط ميسر على 6 أو 12 شهراً
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-toy-red bg-rose-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-toy-red"
                    />
                    <div>
                      <span className="font-bold text-xs block text-slate-900">
                        الدفع عند الاستلام نقداً (كاش)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ادفع عند وصول المندوب لباب منزلك
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 3: Order Summary Table */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-700 mb-2">ملخص الحساب بالجنيه المصري:</h4>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>قيمة الألعاب ({cart.length}):</span>
                  <span className="font-bold text-slate-900">{formatPrice(cartSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>الخصم المطبق:</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-slate-600">
                  <span>الشحن والتوصيل:</span>
                  <span>{shippingCost === 0 ? 'شحن مجاني 🎉' : formatPrice(shippingCost)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-black text-sm text-slate-900">الإجمالي المستحق بالجنيه:</span>
                  <span className="text-xl font-black text-toy-red">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-toy-red hover:bg-rose-600 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-toy-red/25 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                {isProcessing ? (
                  <span>جاري تأكيد وتسجيل طلبك... ⏳</span>
                ) : (
                  <>
                    <span>تأكيد الطلب الآن ({formatPrice(cartTotal)})</span>
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
