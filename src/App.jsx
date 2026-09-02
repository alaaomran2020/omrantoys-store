import React, { useEffect, useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import AdminApp from './admin/AdminApp';
import Header from './components/layout/Header';
import HeroBanner from './components/home/HeroBanner';
import StoreFeaturesBanner from './components/layout/StoreFeaturesBanner';
import CategoryShowcase from './components/home/CategoryShowcase';
import NewProductsSection from './components/home/NewProductsSection';
import FlashDeals from './components/home/FlashDeals';
import ComingSoonSection from './components/home/ComingSoonSection';
import ProductGrid from './components/product/ProductGrid';
import PoliciesSection from './components/home/PoliciesSection';
import FaqSection from './components/home/FaqSection';
import Footer from './components/layout/Footer';

// Modals & Overlays
import ProductDetailModal from './components/product/ProductDetailModal';
import CartDrawer from './components/cart/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import CustomerSignupModal from './components/common/CustomerSignupModal';
import WishlistModal from './components/common/WishlistModal';
import OrderTrackingModal from './components/common/OrderTrackingModal';
import MobileBottomNav from './components/layout/MobileBottomNav';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import LiveSalesNotification from './components/common/LiveSalesNotification';
import FloatingWhatsApp from './components/common/FloatingWhatsApp';
import Toast from './components/common/Toast';

function StoreApp() {
  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAF9F6] selection:bg-toy-red selection:text-white font-cairo">
      {/* Notifications and System Overlays */}
      <Toast />
      <LiveSalesNotification />

      {/* Main Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1 pb-20 md:pb-0">
        <HeroBanner />
        <StoreFeaturesBanner />
        <CategoryShowcase />
        <NewProductsSection />
        <FlashDeals />
        <ProductGrid />
        <ComingSoonSection />
        <PoliciesSection />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
      <MobileBottomNav />
      <FloatingWhatsApp />

      {/* Interactive Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <CustomerSignupModal />
      <WishlistModal />
      <OrderTrackingModal />
      <AdminDashboardModal />
    </div>
  );
}

export default function App() {
  // لوحة الإدارة تطبيق مستقل (Dark Brutalist) يعمل على مسار #/admin —
  // يُركَّب بدلاً من واجهة المتجر بدون تحميل contexts الخاصة بالعميل
  const [isAdminRoute, setIsAdminRoute] = useState(
    () => window.location.hash.startsWith('#/admin')
  );
  useEffect(() => {
    const onHash = () => setIsAdminRoute(window.location.hash.startsWith('#/admin'));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (isAdminRoute) return <AdminApp />;

  return (
    <AuthProvider>
      <StoreProvider>
        <StoreApp />
      </StoreProvider>
    </AuthProvider>
  );
}
