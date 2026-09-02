import React, { useMemo, useState } from 'react';
import {
  Home, Package, Image as ImageIcon, Palette, Globe, HeartPulse, BarChart3,
  Search, Database, FileDown, DatabaseBackup, Settings as SettingsIcon, X, Menu,
  Sparkles, Bell, Command, ShoppingBag, ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ToastStack, useToasts } from './ui';
import { getSettings, saveSettings } from '../../lib/settings';
import { buildAlerts, getNextStep } from '../../lib/adminUtils';
import { getEvents } from '../../lib/analytics';

// Sections
import Overview from './sections/Overview';
import Products from './sections/Products';
import Media from './sections/Media';
import Design from './sections/Design';
import Control from './sections/Control';
import Health from './sections/Health';
import Analytics from './sections/Analytics';
import Visibility from './sections/Visibility';
import Data from './sections/Data';
import Export from './sections/Export';
import Backup from './sections/Backup';
import Import from './sections/Import';
import Orders from './sections/Orders';
import Settings from './sections/Settings';

const NAV = [
  { id: 'overview', label: 'الرئيسية', icon: Home },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
  { id: 'media', label: 'الوسائط', icon: ImageIcon },
  { id: 'design', label: 'تصميم الموقع', icon: Palette },
  { id: 'control', label: 'التحكم بالموقع', icon: Globe },
  { id: 'health', label: 'صحة الموقع', icon: HeartPulse },
  { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
  { id: 'visibility', label: 'Search & AI Visibility', icon: Search },
  { id: 'data', label: 'بيانات الموقع', icon: Database },
  { id: 'export', label: 'التقارير والتصدير', icon: FileDown },
  { id: 'backup', label: 'النسخ الاحتياطي', icon: DatabaseBackup },
  { id: 'import', label: 'الاستيراد', icon: Search },
  { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
];

export default function ControlCenter() {
  const store = useStore();
  const {
    isAdminOpen, setIsAdminOpen,
    products, orders, formatPrice,
    addProduct, updateProduct, deleteProduct, bulkImportProducts, restoreData,
    setSelectedProductModal,
  } = store;

  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const { toasts, notify, dismiss } = useToasts();

  const viewsByProduct = useMemo(() => {
    const counts = {};
    for (const e of getEvents()) {
      if (e.type === 'product_view' && e.data?.productId) {
        counts[e.data.productId] = (counts[e.data.productId] || 0) + 1;
      }
    }
    return counts;
  }, []);

  const navigate = (id) => { setSection(id); setSidebarOpen(false); window.scrollTo({ top: 0 }); };

  const openProduct = (p) => { setIsAdminOpen(false); setSelectedProductModal(p); };

  const restore = (backup) => {
    if (backup?.products || backup?.orders) {
      restoreData({ products: backup.products, orders: backup.orders });
    }
    if (backup?.settings) saveSettings(backup.settings);
  };

  const ctx = {
    ...store,
    products, orders, formatPrice,
    addProduct, updateProduct, deleteProduct, bulkImportProducts,
    settings: getSettings(),
    restore, notify, navigate, openProduct, viewsByProduct,
  };

  // Global search results across products/sections

  const alerts = useMemo(() => buildAlerts(products), [products]);
  const nextStep = useMemo(() => getNextStep(products), [products]);

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return { productMatches: [], navMatches: [], alertMatches: [] };
    const productMatches = products.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)).slice(0, 4);
    const navMatches = NAV.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 4);
    const alertMatches = alerts.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 3);
    return { productMatches, navMatches, alertMatches };
  }, [globalSearch, products, alerts]);

  if (!isAdminOpen) return null;

  const activeNav = NAV.find((n) => n.id === section);

  const renderSection = () => {
    switch (section) {
      case 'overview': return <Overview ctx={ctx} />;
      case 'products': return <Products ctx={ctx} />;
      case 'orders': return <Orders ctx={ctx} />;
      case 'media': return <Media ctx={ctx} />;
      case 'design': return <Design ctx={ctx} />;
      case 'control': return <Control ctx={ctx} />;
      case 'health': return <Health ctx={ctx} />;
      case 'analytics': return <Analytics ctx={ctx} />;
      case 'visibility': return <Visibility ctx={ctx} />;
      case 'data': return <Data ctx={ctx} />;
      case 'export': return <Export ctx={ctx} />;
      case 'backup': return <Backup ctx={ctx} />;
      case 'import': return <Import ctx={ctx} />;
      case 'settings': return <Settings ctx={ctx} />;
      default: return <Overview ctx={ctx} />;
    }
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-72' : 'w-64'} flex flex-col bg-slate-900 text-slate-300 ${mobile ? 'h-full' : 'h-full'}`}>
      <div className="p-4 flex items-center gap-2.5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-white/95 p-1 overflow-hidden"><img src="/brand/logo.png" alt="" className="w-full h-full object-contain" /></div>
        <div>
          <p className="text-sm font-black text-white leading-tight">OMRAN TOYS</p>
          <p className="text-[9px] font-bold text-toy-yellow tracking-wide">CONTROL CENTER</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => navigate(n.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${section === n.id ? 'bg-toy-red text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}>
            <n.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{n.label}</span>
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500">
        <a href="#/admin" className="mb-2 flex items-center justify-center gap-1.5 rounded-lg bg-toy-yellow px-2 py-2 text-[11px] font-black text-slate-900 hover:opacity-90 transition-opacity">
          <ShieldCheck className="w-3.5 h-3.5" />
          لوحة الإدارة المؤمَّنة (واتساب)
        </a>
        صحة الموقع: <b className={nextStep.priority === 'low' ? 'text-emerald-400' : 'text-amber-400'}>{nextStep.priority === 'low' ? 'جيدة' : nextStep.title.split(' ').slice(0, 3).join(' ')}</b>
        <div className="mt-1.5 text-[9px] opacity-60">البيانات محلية • متوافق مع Cloudflare</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100 flex overflow-hidden">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden flex">
          <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="h-full"><Sidebar mobile /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-40">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 cursor-pointer"><Menu className="w-5 h-5" /></button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-toy-red" />
                <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">OMRAN TOYS CONTROL CENTER</h1>
                <span className="hidden sm:inline-flex text-[9px] font-black bg-toy-red/10 text-toy-red px-2 py-0.5 rounded-full">ADMIN</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">الرئيسية / {activeNav?.label}</p>
            </div>
          </div>

          {/* Global search */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Command className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="بحث: منتج، قسم، إعداد..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-toy-red"
            />
            {globalSearch.trim() !== '' && (
              <div className="absolute top-full mt-2 right-0 left-0 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
                {searchResults.productMatches.length > 0 && <p className="text-[10px] font-black text-slate-400 px-2 pt-1">منتجات</p>}
                {searchResults.productMatches.map((p) => (
                  <button key={p.id} onClick={() => openProduct(p)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs cursor-pointer text-right">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-6 h-6 rounded object-cover" />}
                    <span className="font-bold text-slate-700 truncate">{p.name}</span>
                  </button>
                ))}
                {searchResults.navMatches.length > 0 && <p className="text-[10px] font-black text-slate-400 px-2 pt-1">أقسام</p>}
                {searchResults.navMatches.map((n) => (
                  <button key={n.id} onClick={() => { navigate(n.id); setGlobalSearch(''); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-600 cursor-pointer text-right">
                    <n.icon className="w-3.5 h-3.5 text-slate-400" /> {n.label}
                  </button>
                ))}
                {searchResults.alertMatches.length > 0 && <p className="text-[10px] font-black text-slate-400 px-2 pt-1">تنبيهات</p>}
                {searchResults.alertMatches.map((a) => (
                  <button key={a.id} onClick={() => { navigate(a.action?.section || 'health'); setGlobalSearch(''); }} className="w-full text-right p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-600 cursor-pointer">
                    ⚠ {a.title}
                  </button>
                ))}
                {searchResults.productMatches.length + searchResults.navMatches.length + searchResults.alertMatches.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3">لا توجد نتائج لـ "{globalSearch}"</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('health')} className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer" title="التنبيهات">
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && <span className="bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{alerts.length}</span>}
            </button>
            <button onClick={() => setIsAdminOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
