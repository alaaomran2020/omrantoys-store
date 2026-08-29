import React from 'react';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import HeroBanner from './components/home/HeroBanner';
import StoreFeaturesBanner from './components/layout/StoreFeaturesBanner';
import CategoryShowcase from './components/home/CategoryShowcase';
import FlashDeals from './components/home/FlashDeals';
import ProductGrid from './components/product/ProductGrid';
import TestimonialsSection from './components/home/TestimonialsSection';
import PoliciesSection from './components/home/PoliciesSection';
import FaqSection from './components/home/FaqSection';
import Footer from './components/layout/Footer';

// Modals & Overlays
import ProductDetailModal from './components/product/ProductDetailModal';
import CartDrawer from './components/cart/CartDrawer';
import CheckoutModal from './components/checkout/CheckoutModal';
import GiftFinderModal from './components/giftFinder/GiftFinderModal';
import WishlistModal from './components/common/WishlistModal';
import OrderTrackingModal from './components/common/OrderTrackingModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import LiveSalesNotification from './components/common/LiveSalesNotification';
import FloatingWhatsApp from './components/common/FloatingWhatsApp';
import Toast from './components/common/Toast';

// B2B & Auth
import AuthModal from './components/auth/AuthModal';
import MerchantDashboard from './components/b2b/MerchantDashboard';
import B2BBlogSection from './components/blog/B2BBlogSection';

function StoreApp() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] selection:bg-toy-red selection:text-white font-cairo">
      {/* Notifications and System Overlays */}
      <Toast />
      <LiveSalesNotification />

      {/* Main Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <HeroBanner />
        <StoreFeaturesBanner />
        <CategoryShowcase />
        <FlashDeals />
        <ProductGrid />
        <B2BBlogSection />
        <PoliciesSection />
        <TestimonialsSection />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
      <FloatingWhatsApp />

      {/* Interactive Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <GiftFinderModal />
      <WishlistModal />
      <OrderTrackingModal />
      <AdminDashboardModal />
      <AuthModal />
      <MerchantDashboard />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <StoreApp />
      </StoreProvider>
    </AuthProvider>
  );
}
