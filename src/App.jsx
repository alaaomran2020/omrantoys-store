import React from 'react';
import { StoreProvider } from './context/StoreContext';
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
import Toast from './components/common/Toast';

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
        <PoliciesSection />
        <TestimonialsSection />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <GiftFinderModal />
      <WishlistModal />
      <OrderTrackingModal />
      <AdminDashboardModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreApp />
    </StoreProvider>
  );
}
