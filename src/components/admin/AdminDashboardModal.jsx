import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  Users, 
  Edit, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Search,
  Save,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { categories, ageGroups } from '../../data/categories';
import { initialProducts } from '../../data/products';

export default function AdminDashboardModal() {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    formatPrice,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState('products');
  const [saveState, setSaveState] = useState('idle');
  const [syncState, setSyncState] = useState('idle');
  const [orderSearch, setOrderSearch] = useState('');
  const [marketingSettings, setMarketingSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omran_toys_marketing_settings')) || {
        heroTitle: 'ألعاب تفرّحهم وهدايا تفضل فاكرينها',
        heroSubtitle: 'اختيارات حلوة لكل مناسبة، وطلب سهل على WhatsApp.',
        announcement: 'الشحن متاح لكل محافظات مصر',
        urgencyEnabled: false,
        urgencyText: 'الكمية محدودة — إلحق لعبتك قبل ما تخلص',
        couponCode: 'TOY10',
        couponDiscount: 10,
        metaPixelId: '',
        ga4Id: ''
      };
    } catch {
      return {
        heroTitle: 'ألعاب تفرّحهم وهدايا تفضل فاكرينها',
        heroSubtitle: 'اختيارات حلوة لكل مناسبة، وطلب سهل على WhatsApp.',
        announcement: 'الشحن متاح لكل محافظات مصر',
        urgencyEnabled: false,
        urgencyText: 'الكمية محدودة — إلحق لعبتك قبل ما تخلص',
        couponCode: 'TOY10',
        couponDiscount: 10,
        metaPixelId: '',
        ga4Id: ''
      };
    }
  });
  const [marketingSaved, setMarketingSaved] = useState(false);
  const [wholesaleSettings, setWholesaleSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omran_toys_wholesale_settings')) || {
        enabled: true,
        minimumOrder: 5,
        tierOneQuantity: 10,
        tierOneDiscount: 5,
        tierTwoQuantity: 25,
        tierTwoDiscount: 10,
        paymentTerms: 'نقدي أو تحويل، والآجل للعملاء المعتمدين',
        salesNote: 'للطلبات الكبيرة أو أسعار الجملة، ابعتلنا على WhatsApp وهنجهزلك عرض مناسب.'
      };
    } catch {
      return {
        enabled: true,
        minimumOrder: 5,
        tierOneQuantity: 10,
        tierOneDiscount: 5,
        tierTwoQuantity: 25,
        tierTwoDiscount: 10,
        paymentTerms: 'نقدي أو تحويل، والآجل للعملاء المعتمدين',
        salesNote: 'للطلبات الكبيرة أو أسعار الجملة، ابعتلنا على WhatsApp وهنجهزلك عرض مناسب.'
      };
    }
  });
  const [wholesaleSaved, setWholesaleSaved] = useState(false);

  const normalizePhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('20')) return digits;
    if (digits.startsWith('0')) return `20${digits.slice(1)}`;
    return digits;
  };

  const normalizedOrderSearch = orderSearch.trim();
  const filteredOrders = orders.filter((order) => {
    if (!normalizedOrderSearch) return true;
    const query = normalizedOrderSearch.toLowerCase();
    return (
      order.id?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      normalizePhone(order.phone).includes(normalizePhone(normalizedOrderSearch))
    );
  });

  // New Product Form State in EGP
  const [newToy, setNewToy] = useState({
    name: '',
    nameEn: '',
    category: 'educational',
    price: 650,
    originalPrice: 800,
    discountPercent: 18,
    stock: 20,
    ageGroup: '6-8',
    brand: 'عمران للألعاب',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
  });

  // Editing Product State
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);

  if (!isAdminOpen) return null;

  // Stats
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= 12).length;

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newToy.name.trim()) return;
    
    addProduct({
      name: newToy.name,
      nameEn: newToy.nameEn || newToy.name,
      category: newToy.category,
      price: Number(newToy.price),
      originalPrice: Number(newToy.originalPrice || newToy.price),
      discountPercent: Number(newToy.discountPercent || 0),
      stock: Number(newToy.stock),
      ageGroup: newToy.ageGroup,
      brand: newToy.brand,
      description: newToy.description || 'لعبة ممتازة ومسلية من متجر عمران للألعاب',
      images: [newToy.imageUrl]
    });

    // Reset
    setNewToy({
      name: '',
      nameEn: '',
      category: 'educational',
      price: 650,
      originalPrice: 800,
      discountPercent: 18,
      stock: 20,
      ageGroup: '6-8',
      brand: 'عمران للألعاب',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
    });

    setActiveTab('products');
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock);
  };

  const saveEdit = (product) => {
    updateProduct({
      ...product,
      price: Number(editPrice),
      stock: Number(editStock)
    });
    setEditingId(null);
  };

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('omran_toys_products', JSON.stringify(products));
      localStorage.setItem('omran_toys_orders', JSON.stringify(orders));
      localStorage.setItem('omran_toys_last_saved', new Date().toISOString());
      setSaveState('saved');
      showToast?.('تم حفظ المنتجات والطلبات على هذا الجهاز');
      window.setTimeout(() => setSaveState('idle'), 2200);
    } catch {
      showToast?.('حصلت مشكلة في الحفظ، جرّب مرة تانية');
    }
  };

  const handleSyncData = () => {
    setSyncState('syncing');
    window.setTimeout(() => {
      try {
        localStorage.setItem('omran_toys_products', JSON.stringify(products));
        localStorage.setItem('omran_toys_orders', JSON.stringify(orders));
        localStorage.setItem('omran_toys_last_sync', new Date().toISOString());
        setSyncState('synced');
        showToast?.('تمت مزامنة بيانات المتجر على هذا الجهاز');
        window.setTimeout(() => setSyncState('idle'), 2200);
      } catch {
        setSyncState('idle');
        showToast?.('تعذر مزامنة البيانات حاليًا');
      }
    }, 350);
  };

  const handleSaveMarketing = (event) => {
    event.preventDefault();
    localStorage.setItem('omran_toys_marketing_settings', JSON.stringify(marketingSettings));
    setMarketingSaved(true);
    showToast?.('إعدادات التسويق اتحفظت بنجاح');
    window.setTimeout(() => setMarketingSaved(false), 2200);
  };

  const handleSaveWholesale = (event) => {
    event.preventDefault();
    localStorage.setItem('omran_toys_wholesale_settings', JSON.stringify(wholesaleSettings));
    setWholesaleSaved(true);
    showToast?.('إعدادات الجملة اتحفظت بنجاح');
    window.setTimeout(() => setWholesaleSaved(false), 2200);
  };

  const handleResetCatalog = () => {
    if (window.confirm('هل تود استعادة كتالوج الألعاب الافتراضي بالجنيه المصري؟')) {
      localStorage.removeItem('omran_toys_products');
      localStorage.removeItem('omran_toys_version');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-toy-red text-white rounded-xl shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">لوحة إدارة متجر عمران للألعاب</h2>
                <span className="bg-white/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  التعامل بالجنيه المصري 🇪🇬
                </span>
              </div>
              <span className="text-xs text-slate-400">
                التحكم بالمنتجات، المخزون، والطلبات
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSaveChanges}
              className={`hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${saveState === 'saved' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="حفظ المنتجات والطلبات على هذا الجهاز"
            >
              {saveState === 'saved' ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saveState === 'saved' ? 'اتحفظت' : 'حفظ'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncData}
              disabled={syncState === 'syncing'}
              className={`hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer disabled:cursor-wait ${syncState === 'synced' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="مزامنة بيانات المتجر المحفوظة على هذا الجهاز"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncState === 'syncing' ? 'جاري المزامنة...' : syncState === 'synced' ? 'اتزامنت' : 'مزامنة'}</span>
            </button>

            <button
              onClick={handleResetCatalog}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              title="إعادة تعيين المنتجات الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إعادة ضبط الكتالوج</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:px-6 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">إجمالي المبيعات (ج.م)</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {formatPrice(totalSales)}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">عدد الطلبات</span>
            <span className="text-lg sm:text-xl font-black text-toy-blue">
              {orders.length} طلب
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">ألعاب في المتجر</span>
            <span className="text-lg sm:text-xl font-black text-emerald-600">
              {products.length} لعبة
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">تنبيهات المخزون</span>
            <span className="text-lg sm:text-xl font-black text-amber-500 flex items-center gap-1">
              {lowStockCount} ألعاب
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'products'
                ? 'border-toy-red text-toy-red'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            إدارة ألعاب المتجر ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'orders'
                ? 'border-toy-red text-toy-red'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            الطلبات الواردة ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('wholesale')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'wholesale'
                ? 'border-toy-red text-toy-red'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الجملة وCRM</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'marketing'
                ? 'border-toy-red text-toy-red'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>التسويق والإعدادات</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-toy-red text-toy-red'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة لعبة جديدة</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          
          {/* 1. Products Management Tab */}
          {activeTab === 'products' && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">اللعبة</th>
                      <th className="p-3">القسم</th>
                      <th className="p-3">السعر (ج.م)</th>
                      <th className="p-3">المخزون</th>
                      <th className="p-3">العمر</th>
                      <th className="p-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const isEditing = editingId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="p-3 flex items-center gap-2.5">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-xs">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-400">{p.brand} • #{p.sku}</span>
                            </div>
                          </td>

                          <td className="p-3 text-slate-600 font-semibold">
                            {categories.find(c => c.id === p.category)?.name || p.category}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-24 p-1 border rounded font-bold text-slate-900"
                              />
                            ) : (
                              <span className="font-bold text-toy-red">{formatPrice(p.price)}</span>
                            )}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                className="w-16 p-1 border rounded font-bold text-slate-900"
                              />
                            ) : (
                              <span className={`font-bold ${p.stock <= 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                                {p.stock} قطعة
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-slate-600">
                            {p.ageGroup} سنوات
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isEditing ? (
                                <button
                                  onClick={() => saveEdit(p)}
                                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                                  title="حفظ التعديلات"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => startEdit(p)}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="تعديل السعر والمخزون"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="حذف اللعبة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Orders Management Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">ابحث عن طلب بسرعة</h3>
                  <p className="mt-1 text-[11px] text-slate-500">بالموبايل، اسم العميل، أو رقم الطلب.</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="مثال: 01555570269 أو OMR-..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-xs font-bold text-slate-800 outline-none focus:border-toy-red focus:ring-2 focus:ring-toy-red/10"
                    dir="auto"
                  />
                </div>
              </div>
              {orders.length > 0 && filteredOrders.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">رقم الطلب</th>
                        <th className="p-3">العميل</th>
                        <th className="p-3">المحافظة</th>
                        <th className="p-3">عدد الألعاب</th>
                        <th className="p-3">المجموع (ج.م)</th>
                        <th className="p-3">حالة الطلب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            #{o.id}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {o.date}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            {o.customerName}
                            <span className="block text-[10px] text-slate-400 font-normal font-mono" dir="ltr">
                              {o.phone}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{o.city}</td>
                          <td className="p-3 text-slate-700 font-semibold">
                            {o.items?.length || 1} ألعاب
                          </td>
                          <td className="p-3 font-black text-toy-red">
                            {formatPrice(o.total)}
                          </td>
                          <td className="p-3">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className="text-xs font-bold bg-white border border-slate-200 rounded-lg p-1 text-slate-800 focus:outline-none cursor-pointer"
                            >
                              <option value="قيد الانتظار">قيد الانتظار</option>
                              <option value="قيد التجهيز">قيد التجهيز</option>
                              <option value="تم الشحن">تم الشحن</option>
                              <option value="تم التوصيل">تم التوصيل</option>
                              <option value="ملغي">ملغي</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>{orders.length > 0 ? 'مفيش طلب مطابق للبحث ده' : 'لا توجد طلبات مسجلة حتى الآن'}</p>
                  {orders.length > 0 && (
                    <button type="button" onClick={() => setOrderSearch('')} className="mt-3 text-xs font-bold text-toy-red hover:underline">
                      مسح البحث
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Wholesale & CRM Tab */}
          {activeTab === 'wholesale' && (
            <form onSubmit={handleSaveWholesale} className="max-w-3xl mx-auto space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <h3 className="text-sm font-black text-slate-900">إدارة تجارة الجملة</h3>
                <p className="mt-1 text-xs leading-6 text-slate-600">إعدادات تناسب تجار طنطا والغربية: كميات كبيرة، سعر شرائح، وتفاوض مرن عبر WhatsApp.</p>
              </div>
              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-800">
                  <input type="checkbox" checked={wholesaleSettings.enabled} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, enabled: e.target.checked })} className="h-4 w-4 accent-toy-red" />
                  تفعيل وضع تجارة الجملة
                </label>
                <label className="text-xs font-bold text-slate-700">أقل كمية للطلب بالجملة
                  <input type="number" min="1" value={wholesaleSettings.minimumOrder} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, minimumOrder: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" dir="ltr" />
                </label>
                <label className="text-xs font-bold text-slate-700">شروط الدفع
                  <input value={wholesaleSettings.paymentTerms} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, paymentTerms: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" />
                </label>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs font-black text-emerald-900">شريحة السعر الأولى</p>
                  <div className="mt-2 grid grid-cols-2 gap-2"><input type="number" min="1" value={wholesaleSettings.tierOneQuantity} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, tierOneQuantity: Number(e.target.value) })} className="rounded-lg border border-emerald-100 p-2 text-xs" placeholder="الكمية" /><input type="number" min="0" max="100" value={wholesaleSettings.tierOneDiscount} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, tierOneDiscount: Number(e.target.value) })} className="rounded-lg border border-emerald-100 p-2 text-xs" placeholder="الخصم %" /></div>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-xs font-black text-amber-900">شريحة السعر الثانية</p>
                  <div className="mt-2 grid grid-cols-2 gap-2"><input type="number" min="1" value={wholesaleSettings.tierTwoQuantity} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, tierTwoQuantity: Number(e.target.value) })} className="rounded-lg border border-amber-100 p-2 text-xs" placeholder="الكمية" /><input type="number" min="0" max="100" value={wholesaleSettings.tierTwoDiscount} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, tierTwoDiscount: Number(e.target.value) })} className="rounded-lg border border-amber-100 p-2 text-xs" placeholder="الخصم %" /></div>
                </div>
                <label className="sm:col-span-2 text-xs font-bold text-slate-700">ملاحظة فريق المبيعات
                  <textarea rows="3" value={wholesaleSettings.salesNote} onChange={(e) => setWholesaleSettings({ ...wholesaleSettings, salesNote: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" />
                </label>
              </div>
              <div className="flex gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-xs leading-6 text-slate-600">
                <span className="font-black text-toy-red">CRM</span>
                <p>استخدم البحث بالهاتف في تبويب الطلبات لمتابعة العميل، ثم حدّث حالة الطلب بعد التأكيد أو الشحن.</p>
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black text-white transition-colors hover:bg-toy-red">
                {wholesaleSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {wholesaleSaved ? 'إعدادات الجملة اتحفظت' : 'حفظ إعدادات الجملة'}
              </button>
            </form>
          )}

          {/* 4. Marketing & Settings Tab */}
          {activeTab === 'marketing' && (
            <form onSubmit={handleSaveMarketing} className="max-w-3xl mx-auto space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <h3 className="text-sm font-black text-slate-900">أدوات ذكية لتحويل الزوار لعملاء</h3>
                <p className="mt-1 text-xs leading-6 text-slate-500">عدّل رسالة الصفحة البيعية والعروض من مكان واحد. كل القيم بالجنيه المصري عند الحاجة.</p>
              </div>

              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                <label className="sm:col-span-2 text-xs font-bold text-slate-700">عنوان الصفحة الرئيسية
                  <input value={marketingSettings.heroTitle} onChange={(e) => setMarketingSettings({ ...marketingSettings, heroTitle: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold outline-none focus:border-toy-red" />
                </label>
                <label className="sm:col-span-2 text-xs font-bold text-slate-700">الوصف البيعي
                  <textarea rows="2" value={marketingSettings.heroSubtitle} onChange={(e) => setMarketingSettings({ ...marketingSettings, heroSubtitle: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" />
                </label>
                <label className="text-xs font-bold text-slate-700">شريط الإعلان
                  <input value={marketingSettings.announcement} onChange={(e) => setMarketingSettings({ ...marketingSettings, announcement: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" />
                </label>
                <label className="text-xs font-bold text-slate-700">كود الكوبون
                  <input value={marketingSettings.couponCode} onChange={(e) => setMarketingSettings({ ...marketingSettings, couponCode: e.target.value.toUpperCase() })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-black uppercase outline-none focus:border-toy-red" dir="ltr" />
                </label>
                <label className="text-xs font-bold text-slate-700">نسبة الخصم %
                  <input type="number" min="0" max="100" value={marketingSettings.couponDiscount} onChange={(e) => setMarketingSettings({ ...marketingSettings, couponDiscount: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" dir="ltr" />
                </label>
                <label className="text-xs font-bold text-slate-700">Meta Pixel ID (اختياري)
                  <input value={marketingSettings.metaPixelId} onChange={(e) => setMarketingSettings({ ...marketingSettings, metaPixelId: e.target.value })} placeholder="ضع الـ ID عند توفره" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" dir="ltr" />
                </label>
                <label className="text-xs font-bold text-slate-700">Google Analytics ID (اختياري)
                  <input value={marketingSettings.ga4Id} onChange={(e) => setMarketingSettings({ ...marketingSettings, ga4Id: e.target.value })} placeholder="G-XXXXXXXXXX" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-toy-red" dir="ltr" />
                </label>
                <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-900">
                  <input type="checkbox" checked={marketingSettings.urgencyEnabled} onChange={(e) => setMarketingSettings({ ...marketingSettings, urgencyEnabled: e.target.checked })} className="h-4 w-4 accent-amber-500" />
                  تفعيل رسالة الإلحاح والكمية المحدودة
                </label>
                <label className="sm:col-span-2 text-xs font-bold text-slate-700">نص الإلحاح
                  <input value={marketingSettings.urgencyText} onChange={(e) => setMarketingSettings({ ...marketingSettings, urgencyText: e.target.value })} disabled={!marketingSettings.urgencyEnabled} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none disabled:bg-slate-100" />
                </label>
              </div>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black text-white transition-colors hover:bg-toy-red">
                {marketingSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {marketingSaved ? 'الإعدادات اتحفظت' : 'حفظ إعدادات التسويق'}
              </button>
            </form>
          )}

          {/* 4. Add New Product Tab */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateProduct} className="max-w-2xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-toy-red" />
                <span>إضافة لعبة جديدة بالجنيه المصري</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم اللعبة بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    value={newToy.name}
                    onChange={(e) => setNewToy({ ...newToy, name: e.target.value })}
                    placeholder="مثال: سيارة شرطة لاسلكية ذكية"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القسم التصنيفي *
                  </label>
                  <select
                    value={newToy.category}
                    onChange={(e) => setNewToy({ ...newToy, category: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {categories.slice(1).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    سعر البيع (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newToy.price}
                    onChange={(e) => setNewToy({ ...newToy, price: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر قبل الخصم (ج.م)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newToy.originalPrice}
                    onChange={(e) => setNewToy({ ...newToy, originalPrice: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الكمية المتوفرة *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newToy.stock}
                    onChange={(e) => setNewToy({ ...newToy, stock: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الفئة العمرية المناسبة
                  </label>
                  <select
                    value={newToy.ageGroup}
                    onChange={(e) => setNewToy({ ...newToy, ageGroup: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {ageGroups.slice(1).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الماركة / الشركة المصنعة
                  </label>
                  <input
                    type="text"
                    value={newToy.brand}
                    onChange={(e) => setNewToy({ ...newToy, brand: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رابط صورة اللعبة (Image URL)
                </label>
                <input
                  type="url"
                  value={newToy.imageUrl}
                  onChange={(e) => setNewToy({ ...newToy, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف اللعبة ومميزاتها للأطفال
                </label>
                <textarea
                  rows="3"
                  value={newToy.description}
                  onChange={(e) => setNewToy({ ...newToy, description: e.target.value })}
                  placeholder="اكتب وصفاً جذاباً للعبة..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-toy-red text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                نشر اللعبة في المتجر بالجنيه المصري 🚀
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
