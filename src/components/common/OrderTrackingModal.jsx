import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const normalizeEgyptianPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  return digits;
};

export default function OrderTrackingModal() {
  const { isTrackingOpen, setIsTrackingOpen, orders, formatPrice } = useStore();
  const [trackingInput, setTrackingInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchedOrders, setSearchedOrders] = useState([]);
  const [notFound, setNotFound] = useState(false);

  if (!isTrackingOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const rawQuery = trackingInput.trim();
    const queryId = rawQuery.toUpperCase().replace('#', '');
    const queryPhone = normalizeEgyptianPhone(rawQuery);
    const foundOrders = orders
      .filter((order) => {
        const matchesId = order.id?.toUpperCase() === queryId;
        const matchesPhone = queryPhone.length >= 10 && normalizeEgyptianPhone(order.phone) === queryPhone;
        return matchesId || matchesPhone;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setSearchedOrders(foundOrders);
    setSearchedOrder(foundOrders[0] || null);
    setNotFound(foundOrders.length === 0);
  };

  const steps = [
    { title: 'تم استلام الطلب', desc: 'تم تأكيد طلبك بنجاح', icon: Clock },
    { title: 'التجهيز وفحص الجودة', desc: 'مراجعة الطلب وتغليفه بشكل آمن', icon: Package },
    { title: 'تم التسليم لشركة الشحن', desc: 'الشحنة بحوزة المندوب السريع', icon: Truck },
    { title: 'تم التوصيل بنجاح', desc: 'وصل طلبك وبدأت الفرحة!', icon: CheckCircle2 }
  ];

  // Helper to determine active step index based on order status
  const getActiveStepIndex = (status) => {
    if (status === 'قيد الانتظار') return 0;
    if (status === 'قيد التجهيز') return 1;
    if (status === 'تم الشحن') return 2;
    if (status === 'تم التوصيل' || status === 'مكتمل') return 3;
    return 1;
  };

  const activeIndex = searchedOrder ? getActiveStepIndex(searchedOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] sm:max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-blue-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                تتبع حالة الشحنة والطلب 📦
              </h2>
              <span className="text-xs text-slate-500">
                أدخل رقم الطلب أو رقم الجوال لمعرفة مكان ألعابك
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsTrackingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="رقم الطلب أو رقم الموبايل (مثال: 01555570269)..."
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
            >
              بحث وتتبع
            </button>
          </form>
        </div>

        {/* Tracking Details */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          {searchedOrder ? (
            <div className="space-y-6">
              {searchedOrders.length > 1 && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                  <p className="mb-2 text-xs font-bold text-blue-900">لقينا {searchedOrders.length} طلبات بنفس رقم الموبايل — اختار الطلب اللي عايز تتابعه:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchedOrders.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSearchedOrder(order)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${searchedOrder.id === order.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-100'}`}
                      >
                        #{order.id} · {order.status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">طلب رقم:</span>
                    <span className="font-mono font-black text-sm text-slate-900">
                      #{searchedOrder.id}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {searchedOrder.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    تاريخ الطلب: {searchedOrder.date} • المستلم: {searchedOrder.customerName}
                  </span>
                </div>

                <div className="text-right sm:text-left">
                  <span className="text-[11px] text-slate-400 block">إجمالي الطلب:</span>
                  <span className="text-sm font-black text-toy-red">
                    {formatPrice(searchedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div className="py-2">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">
                  مسار الشحنة
                </h4>
                <div className="relative">
                  {/* Vertical / Horizontal Connection Line */}
                  <div className="hidden sm:block absolute top-5 right-6 left-6 h-0.5 bg-slate-200 -z-0" />

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                    {steps.map((s, idx) => {
                      const StepIcon = s.icon;
                      const isCompleted = idx <= activeIndex;
                      const isCurrent = idx === activeIndex;

                      return (
                        <div
                          key={idx}
                          className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'bg-slate-100 text-slate-400'
                            } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h5
                              className={`text-xs font-bold ${
                                isCompleted ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {s.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 block sm:mt-0.5">
                              {s.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Destination Address Card */}
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/80 flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">عنوان التوصيل:</span>
                  <p className="text-slate-600 mt-0.5">
                    {searchedOrder.city} - {searchedOrder.address}
                  </p>
                </div>
              </div>

              {/* Items in order */}
              <div>
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                  الألعاب في هذه الشحنة ({searchedOrder.items.length})
                </h4>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                  {searchedOrder.items.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-[11px]">
                          ×{item.quantity}
                        </span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : notFound ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                عذراً، لم نتمكن من العثور على طلب بهذا الرقم
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                يرجى التأكد من كتابة رقم الطلب بالشكل الصحيح أو رقم الجوال المستخدم أثناء إتمام الطلب.
              </p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 text-blue-200 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 mb-1">اعرف طلبك فين بسهولة</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">اكتب رقم الموبايل اللي سجلت بيه الطلب أو رقم الطلب، وإحنا هنقولك آخر تحديث.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
