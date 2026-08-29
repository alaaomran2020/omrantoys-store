import React, { useState } from 'react';
import { 
  X, Store, Package, TrendingUp, Clock, RotateCcw, ShoppingCart, 
  Truck, CheckCircle, AlertTriangle, CreditCard, BarChart3, 
  Gift, Percent, MapPin, Phone, Mail, Building, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function MerchantDashboard() {
  const { profile, isMerchant, wholesaleTier, discountRate } = useAuth();
  const { isMerchantDashboardOpen, setIsMerchantDashboardOpen, orders, formatPrice, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isMerchantDashboardOpen) return null;

  const wholesaleOrders = orders.filter(o => o.user_type === 'wholesale' || isMerchant);
  const totalSpent = wholesaleOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrder = wholesaleOrders.length ? Math.round(totalSpent / wholesaleOrders.length) : 0;

  const tierInfo = {
    tier1: { name: 'تاجر مبتدئ', discount: '10-15%', minOrder: 5, color: 'bg-slate-100 text-slate-700', next: 'tier2' },
    tier2: { name: 'تاجر معتمد', discount: '15-20%', minOrder: 10, color: 'bg-blue-100 text-blue-800', next: 'tier3' },
    tier3: { name: 'موزع رئيسي', discount: '20-25%', minOrder: 25, color: 'bg-amber-100 text-amber-800', next: null },
  };
  const currentTier = tierInfo[wholesaleTier] || tierInfo.tier1;

  const handleReorder = (order) => {
    if (!order.items) return;
    order.items.forEach(item => {
      // Find product mock - in real app fetch from supabase
      addToCart({ 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        images: [item.image], 
        stock: 100,
        sku: item.id 
      }, item.quantity);
    });
  };

  return (
    <div className="fixed inset-0 z-[65] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white relative">
          <button onClick={() => setIsMerchantDashboardOpen(false)} className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer"><X className="w-5 h-5" /></button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center"><Store className="w-7 h-7" /></div>
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  لوحة تحكم التاجر
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${currentTier.color}`}>{currentTier.name}</span>
                </h2>
                <p className="text-sm text-white/80 mt-1">{profile?.business_name || profile?.full_name} • {profile?.governorate}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-white/60">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {profile?.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {profile?.phone}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-xs text-white/60">نسبة خصم الجملة الحالية</div>
              <div className="text-2xl font-black flex items-center gap-2 mt-1">
                <Percent className="w-5 h-5 text-emerald-300" />
                {discountRate}% خصم
              </div>
              <div className="text-[11px] text-emerald-200 mt-1">تطبق تلقائياً على جميع المنتجات</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'orders', label: 'سجل الطلبات', icon: Package },
              { id: 'pricing', label: 'أسعار الجملة', icon: CreditCard },
              { id: 'profile', label: 'بيانات النشاط', icon: Building },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id ? 'bg-white text-slate-900 shadow' : 'bg-white/10 text-white/80 hover:bg-white/15'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">إجمالي الطلبات</span>
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{wholesaleOrders.length}</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">+2 هذا الشهر</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">إجمالي المشتريات</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{formatPrice(totalSpent)}</div>
                  <div className="text-[11px] text-slate-400 mt-1">متوسط {formatPrice(avgOrder)}/طلب</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">التوفير من الجملة</span>
                    <Gift className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 mt-2">{formatPrice(Math.round(totalSpent * (discountRate/100)))}</div>
                  <div className="text-[11px] text-slate-400 mt-1">بفضل خصم {discountRate}%</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">مستوى التاجر</span>
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-2">{currentTier.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{currentTier.next ? `ترقية لـ ${tierInfo[currentTier.next].name} عند 25 طلب` : 'أعلى مستوى!'}</div>
                </div>
              </div>

              {/* Wholesale Benefits */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
                <h3 className="font-black text-sm text-emerald-900 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> مزايا حساب الجملة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0"><Percent className="w-4 h-4" /></div>
                    <div><div className="text-xs font-bold text-emerald-900">خصم حتى 25%</div><div className="text-[11px] text-emerald-700 mt-0.5">أسعار جملة مخفضة تلقائياً حسب الكمية والمستوى</div></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0"><Truck className="w-4 h-4" /></div>
                    <div><div className="text-xs font-bold text-emerald-900">شحن مجاني</div><div className="text-[11px] text-emerald-700 mt-0.5">للطلبات فوق 800 ج.م بدلاً من 1000 ج.م</div></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0"><Clock className="w-4 h-4" /></div>
                    <div><div className="text-xs font-bold text-emerald-900">إعادة طلب سريع</div><div className="text-[11px] text-emerald-700 mt-0.5">زر واحد لإعادة طلب المنتجات التي نفدت من محلك</div></div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-sm text-slate-900">آخر الطلبات</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-toy-red hover:underline cursor-pointer">عرض الكل</button>
                </div>
                {wholesaleOrders.length ? (
                  <div className="space-y-3">
                    {wholesaleOrders.slice(0, 3).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <div className="text-xs font-black text-slate-900">#{order.id}</div>
                          <div className="text-[11px] text-slate-500">{order.date} • {order.items?.length || 0} منتج • {formatPrice(order.total)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${order.status === 'تم التوصيل' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{order.status}</span>
                          <button onClick={() => handleReorder(order)} className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-toy-red transition-colors cursor-pointer" title="إعادة الطلب"><RotateCcw className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">لا توجد طلبات بعد</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900">سجل الطلبات ({wholesaleOrders.length})</h3>
                <div className="text-xs text-slate-500">إجمالي {formatPrice(totalSpent)}</div>
              </div>
              {wholesaleOrders.length ? (
                <div className="grid gap-3">
                  {wholesaleOrders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-slate-900">#{order.id}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${order.status === 'تم التوصيل' ? 'bg-emerald-100 text-emerald-800' : order.status === 'تم الشحن' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{order.status}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                            <span>{order.date}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.city}</span>
                            <span>{order.items?.length} منتج</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {order.items?.slice(0, 4).map((it, idx) => (
                              <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">{it.name} ×{it.quantity}</span>
                            ))}
                            {order.items?.length > 4 && <span className="text-[11px] text-slate-400">+{order.items.length - 4} أخرى</span>}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-black text-sm text-slate-900">{formatPrice(order.total)}</div>
                          {order.wholesale_discount_applied > 0 && <div className="text-[11px] text-emerald-600 font-bold">وفرت {formatPrice(order.wholesale_discount_applied)}</div>}
                          <button onClick={() => handleReorder(order)} className="mt-2 w-full bg-slate-900 hover:bg-toy-red text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                            <RotateCcw className="w-3.5 h-3.5" />
                            إعادة الطلب
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                  <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-600">لا توجد طلبات جملة بعد</p>
                  <p className="text-xs text-slate-400 mt-1">ابدأ التسوق بأسعار الجملة الآن</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-black text-sm text-slate-900 mb-1">هيكل أسعار الجملة</h3>
                <p className="text-xs text-slate-500 mb-4">الأسعار تطبق تلقائياً عند تسجيل دخول التاجر - بدون أكواد خصم</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="text-right py-2 font-bold">المستوى</th>
                        <th className="text-right py-2 font-bold">الحد الأدنى</th>
                        <th className="text-right py-2 font-bold">نسبة الخصم</th>
                        <th className="text-right py-2 font-bold">شحن مجاني</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr className={wholesaleTier === 'tier1' ? 'bg-amber-50' : ''}>
                        <td className="py-3 font-bold">تاجر مبتدئ</td>
                        <td>5 قطع</td>
                        <td className="font-black text-emerald-600">10-15%</td>
                        <td>فوق 800 ج.م</td>
                      </tr>
                      <tr className={wholesaleTier === 'tier2' ? 'bg-amber-50' : ''}>
                        <td className="py-3 font-bold">تاجر معتمد ⭐</td>
                        <td>10 قطع</td>
                        <td className="font-black text-emerald-600">15-20%</td>
                        <td>فوق 700 ج.م</td>
                      </tr>
                      <tr className={wholesaleTier === 'tier3' ? 'bg-amber-50' : ''}>
                        <td className="py-3 font-bold">موزع رئيسي 🏆</td>
                        <td>25 قطعة</td>
                        <td className="font-black text-emerald-600">20-25%</td>
                        <td>فوق 500 ج.م</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                  <strong>كيف تتم الترقية؟</strong> يتم ترقية مستوى التاجر تلقائياً بناءً على إجمالي عدد الطلبات وقيمة المشتريات خلال آخر 3 أشهر. تواصل معنا عبر واتساب للاستفسار عن ترقيتك.
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-black text-sm text-slate-900 mb-3">مثال: فرق السعر</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border border-slate-200 rounded-xl p-3">
                    <div className="text-[11px] text-slate-500">سعر القطاعي</div>
                    <div className="font-black text-slate-900">1,200 ج.م</div>
                    <div className="text-[11px] text-slate-400 line-through">1,400 ج.م</div>
                  </div>
                  <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-3">
                    <div className="text-[11px] text-emerald-700 font-bold">سعر الجملة ({discountRate}%)</div>
                    <div className="font-black text-emerald-800">{Math.round(1200 * (1 - discountRate/100))} ج.م</div>
                    <div className="text-[11px] text-emerald-600">وفر {Math.round(1200 * (discountRate/100))} ج.م</div>
                  </div>
                  <div className="border border-amber-200 bg-amber-50 rounded-xl p-3">
                    <div className="text-[11px] text-amber-700 font-bold">عند طلب 10 قطع</div>
                    <div className="font-black text-amber-800">{Math.round(1200 * 10 * (1 - discountRate/100))} ج.م</div>
                    <div className="text-[11px] text-amber-600">بدلاً من {1200 * 10} ج.م</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-black text-sm text-slate-900 mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-toy-red" /> بيانات النشاط التجاري</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-xs text-slate-500 font-bold">اسم النشاط</span><div className="font-bold text-slate-900 mt-1">{profile?.business_name || 'غير محدد'}</div></div>
                  <div><span className="text-xs text-slate-500 font-bold">اسم المسؤول</span><div className="font-bold text-slate-900 mt-1">{profile?.full_name}</div></div>
                  <div><span className="text-xs text-slate-500 font-bold">البريد</span><div className="font-bold text-slate-900 mt-1">{profile?.email}</div></div>
                  <div><span className="text-xs text-slate-500 font-bold">الهاتف</span><div className="font-bold text-slate-900 mt-1">{profile?.phone}</div></div>
                  <div><span className="text-xs text-slate-500 font-bold">المحافظة</span><div className="font-bold text-slate-900 mt-1">{profile?.governorate}</div></div>
                  <div><span className="text-xs text-slate-500 font-bold">حالة التوثيق</span><div className="mt-1"><span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> موثق</span></div></div>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-slate-600">
                      <strong className="text-slate-900">لرفع مستوى التاجر:</strong> تواصل مع فريق المبيعات عبر واتساب على <strong>01555570269</strong> وأرسل صور المحل والسجل التجاري (إن وجد). يتم التفعيل خلال 24 ساعة عمل.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
