import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchStorefrontProducts } from '../lib/productEngine';
import { calculateShippingCost, calculateCartWeight, calculateCartVolume } from '../lib/shippingCalculator';
import { track, EVENTS } from '../lib/analytics';

const StoreContext = createContext();
const CATALOG_CACHE_KEY = 'omran_toys_products';

/**
 * Fail-Closed: لا نعرض أبدًا كتالوجًا مصنوعًا يدويًا كـ fallback.
 * المصدر الوحيد للعرض = Product Engine (Google Sheet بعد بوابات النشر).
 * عند تعذر المحرك: نعرض آخر نسخة موثقة من المحرك نفسه (cache) أو لا شيء.
 * ملف src/data/products.js يبقى أرشيفًا مرجعيًا — ليس مصدر عرض.
 */

const hasKnownPrice = product => Number.isFinite(product?.price) || Number.isFinite(product?.retail_price);
const getKnownPrice = product => Number.isFinite(product?.price)
  ? product.price
  : Number.isFinite(product?.retail_price) ? product.retail_price : null;
const hasKnownStock = product => Number.isFinite(product?.stock) || Number.isFinite(product?.stock_quantity);
const getKnownStock = product => Number.isFinite(product?.stock)
  ? product.stock
  : Number.isFinite(product?.stock_quantity) ? product.stock_quantity : null;

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [catalogState, setCatalogState] = useState({ source: 'uninitialized', status: 'loading', fetchedAt: null, error: null });

  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('omran_toys_cart') || '[]'); } catch { return []; } });
  const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('omran_toys_wishlist') || '[]'); } catch { return []; } });
  const [orders, setOrders] = useState(() => { try { return JSON.parse(localStorage.getItem('omran_toys_orders') || '[]'); } catch { return []; } });
  const [stockNotifications, setStockNotifications] = useState(() => { try { return JSON.parse(localStorage.getItem('omran_stock_notifications') || '[]'); } catch { return []; } });
  const currency = 'EGP';

  const [advancedFilters, setAdvancedFilters] = useState({ search: '', category: 'all', ageGroup: 'all', toyType: 'all', brand: 'all', availability: 'all', priceMin: 0, priceMax: 2500 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [priceRange, setPriceRange] = useState(2500);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const [selectedGovernorate, setSelectedGovernorate] = useState('طنطا (الغربية)');
  const [userTypeForShipping, setUserTypeForShipping] = useState('retail');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Product Engine is the ONLY catalog source. Cache is engine-originated only.
  useEffect(() => {
    const controller = new AbortController();
    fetchStorefrontProducts({ signal: controller.signal })
      .then(payload => {
        setProducts(payload.products);
        setCatalogState({ source: 'product-engine', status: payload.status, fetchedAt: payload.fetchedAt, error: null });
        localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(payload.products));
      })
      .catch(error => {
        if (error?.name === 'AbortError') return;
        let cached = null;
        try { cached = JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY) || 'null'); } catch { cached = null; }
        if (Array.isArray(cached) && cached.length && cached.every(item => item?.catalogSource === 'product-engine')) {
          setProducts(cached);
          setCatalogState({ source: 'cache-fallback', status: 'degraded', fetchedAt: null, error: error?.message || 'Product Engine unavailable' });
        } else {
          // Fail-Closed: لا منتجات مختلقة. صفحة فارغة + حالة واضحة أفضل من كتالوج مزيف.
          setProducts([]);
          setCatalogState({ source: 'unavailable', status: 'degraded', fetchedAt: null, error: error?.message || 'Product Engine unavailable' });
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => { localStorage.setItem('omran_toys_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('omran_toys_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('omran_toys_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('omran_stock_notifications', JSON.stringify(stockNotifications)); }, [stockNotifications]);
  useEffect(() => { setAdvancedFilters(f => ({ ...f, search: searchQuery })); }, [searchQuery]);
  useEffect(() => { setAdvancedFilters(f => ({ ...f, category: selectedCategory })); }, [selectedCategory]);
  useEffect(() => { setAdvancedFilters(f => ({ ...f, ageGroup: selectedAgeGroup })); }, [selectedAgeGroup]);

  const getProductCapabilities = product => {
    const priceKnown = hasKnownPrice(product);
    const stockKnown = hasKnownStock(product);
    const stock = getKnownStock(product);
    return {
      priceKnown,
      stockKnown,
      stock,
      canCheckout: priceKnown && (!stockKnown || stock > 0),
      canAddToCart: priceKnown && (!stockKnown || stock > 0),
      inquiryOnly: !priceKnown,
      availability: !stockKnown ? 'unknown' : stock > 0 ? 'in_stock' : 'out_of_stock',
    };
  };

  const formatPrice = amount => Number.isFinite(amount)
    ? `${Math.round(amount).toLocaleString('en-US')} ج.م`
    : 'للاستفسار والكميات';

  const getEffectivePrice = product => getKnownPrice(product);

  const addToCart = (product, quantity = 1) => {
    const capabilities = getProductCapabilities(product);
    if (capabilities.inquiryOnly) {
      showToast('هذا المنتج متاح للاستفسار والكميات ولا يدخل الدفع الرقمي قبل تأكيد السعر.', 'info');
      return false;
    }
    if (capabilities.stockKnown && capabilities.stock <= 0) {
      showToast(`"${product.name}" غير متوفر حالياً - يمكنك تفعيل تنبيه عند التوفر`, 'info');
      return false;
    }

    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    let addedQuantity = requestedQuantity;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      const currentQuantity = existingIndex > -1 ? prev[existingIndex].quantity : 0;
      if (capabilities.stockKnown) addedQuantity = Math.min(requestedQuantity, Math.max(0, capabilities.stock - currentQuantity));
      if (addedQuantity <= 0) return prev;
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: currentQuantity + addedQuantity };
        return updated;
      }
      return [...prev, { product, quantity: addedQuantity }];
    });
    showToast(addedQuantity < requestedQuantity ? `تمت إضافة الكمية المتاحة فقط من "${product.name}"` : `تمت إضافة "${product.name}" إلى السلة 🛍️`, addedQuantity < requestedQuantity ? 'info' : 'success');
    track(EVENTS.addToCart, { productId: product.id, name: product.name, quantity: addedQuantity });
    return true;
  };

  const removeFromCart = productId => { setCart(prev => prev.filter(item => item.product.id !== productId)); showToast('تم حذف المنتج من السلة', 'info'); };
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item;
      const stock = getKnownStock(item.product);
      return { ...item, quantity: stock === null ? Number(newQuantity) : Math.min(Number(newQuantity), stock) };
    }));
  };
  const clearCart = () => setCart([]);

  const toggleWishlist = productId => setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  const isInWishlist = productId => wishlist.includes(productId);

  const checkoutEligible = cart.length > 0 && cart.every(item => getProductCapabilities(item.product).canCheckout);
  const cartSubtotalRetail = cart.reduce((sum, item) => sum + (getKnownPrice(item.product) ?? 0) * item.quantity, 0);
  const cartSubtotal = cartSubtotalRetail;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCalculation = useMemo(() => {
    const weight = calculateCartWeight(cart);
    const volume = calculateCartVolume(cart);
    return calculateShippingCost({ governorate: selectedGovernorate, totalWeightGrams: weight, subtotal: cartSubtotal, userType: userTypeForShipping, totalVolume: volume });
  }, [cart, cartSubtotal, selectedGovernorate, userTypeForShipping]);
  const shippingCost = cartSubtotal === 0 ? 0 : shippingCalculation.cost;
  const discountAmount = 0;
  const vatAmount = Math.max(0, cartSubtotal) * 0.14;
  const cartTotal = cartSubtotal + shippingCost;

  const placeOrder = orderData => {
    if (!checkoutEligible) {
      showToast('لا يمكن إتمام الدفع قبل تأكيد السعر والتوفر لكل المنتجات. استخدم «للاستفسار والكميات».', 'info');
      return null;
    }
    const newOrder = {
      id: `OMR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({ id: item.product.id, name: item.product.name, price: getKnownPrice(item.product), quantity: item.quantity, image: item.product.images?.[0] || null, sku: item.product.sku || '' })),
      subtotal: cartSubtotal, discount: discountAmount, shipping: shippingCost, shipping_breakdown: shippingCalculation.breakdown,
      vat: vatAmount, total: cartTotal, status: 'قيد الانتظار', estimated_delivery: shippingCalculation.estimatedDays,
      user_type: orderData?.user_type || userTypeForShipping, ...orderData,
    };
    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    track(EVENTS.orderPlaced, { orderId: newOrder.id, total: cartTotal });
    return newOrder;
  };

  // Legacy admin mutations remain for compatibility, but Product Engine data is not mutated remotely here.
  const addProduct = newProduct => { setProducts(prev => [{ id: String(Date.now()), catalogSource: 'local-admin', ...newProduct }, ...prev]); showToast('تمت إضافة المنتج محلياً'); };
  const bulkImportProducts = productsArray => { setProducts(prev => [...productsArray, ...prev]); showToast(`تم استيراد ${productsArray.length} منتج محلياً`); };
  const updateProduct = updatedProduct => { setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p)); showToast('تم تحديث المنتج محلياً'); };
  const deleteProduct = productId => { setProducts(prev => prev.filter(p => p.id !== productId)); showToast('تم حذف المنتج محلياً', 'info'); };
  const updateOrderStatus = (orderId, status) => setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
  const restoreData = ({ products: nextProducts, orders: nextOrders }) => { if (Array.isArray(nextProducts)) setProducts(nextProducts); if (Array.isArray(nextOrders)) setOrders(nextOrders); showToast('تمت استعادة النسخة الاحتياطية'); };
  const subscribeStockNotification = (productId, contactInfo) => { setStockNotifications(prev => [...prev, { id: Date.now(), product_id: productId, ...contactInfo, created_at: new Date().toISOString() }]); showToast('تم تسجيل طلب التنبيه عند التوفر 🔔'); return true; };

  const filteredProducts = useMemo(() => products.filter(product => {
    if (product.is_visible === false || product.active === false) return false;
    const q = advancedFilters.search.trim().toLowerCase();
    if (q && ![product.name, product.description, product.brand, ...(product.tags || [])].filter(Boolean).some(value => String(value).toLowerCase().includes(q))) return false;
    if (advancedFilters.category !== 'all' && product.category !== advancedFilters.category) return false;
    if (advancedFilters.ageGroup !== 'all' && product.ageGroup && product.ageGroup !== advancedFilters.ageGroup) return false;
    if (advancedFilters.brand !== 'all' && product.brand && product.brand !== advancedFilters.brand) return false;
    const price = getKnownPrice(product);
    if (price !== null && (price < advancedFilters.priceMin || price > advancedFilters.priceMax)) return false;
    const capabilities = getProductCapabilities(product);
    if (advancedFilters.availability === 'in_stock' && capabilities.availability !== 'in_stock') return false;
    if (advancedFilters.availability === 'out_of_stock' && capabilities.availability !== 'out_of_stock') return false;
    if (advancedFilters.availability === 'low_stock' && (!capabilities.stockKnown || capabilities.stock <= 0 || capabilities.stock > 5)) return false;
    if (advancedFilters.availability === 'on_sale' && !(product.discountPercent > 0)) return false;
    if (inStockOnly && capabilities.availability === 'out_of_stock') return false;
    if (onSaleOnly && !(product.discountPercent > 0)) return false;
    return true;
  }), [products, advancedFilters, inStockOnly, onSaleOnly]);

  return <StoreContext.Provider value={{
    products, filteredProducts, catalogState, getProductCapabilities, checkoutEligible,
    cart, wishlist, currency, orders, stockNotifications,
    searchQuery, selectedCategory, selectedAgeGroup, priceRange, sortBy, inStockOnly, onSaleOnly, advancedFilters, setAdvancedFilters,
    selectedGovernorate, setSelectedGovernorate, userTypeForShipping, setUserTypeForShipping, shippingCalculation,
    cartSubtotal, cartSubtotalRetail, totalItemsCount, shippingCost, discountAmount, vatAmount, cartTotal,
    isCartOpen, isCheckoutOpen, isWishlistOpen, isAdminOpen, isTrackingOpen, isSignupOpen, selectedProductModal, lastPlacedOrder, toast,
    setSearchQuery, setSelectedCategory, setSelectedAgeGroup, setPriceRange, setSortBy, setInStockOnly, setOnSaleOnly,
    setIsCartOpen, setIsCheckoutOpen, setIsWishlistOpen, setIsAdminOpen, setIsTrackingOpen, setIsSignupOpen, setSelectedProductModal, setLastPlacedOrder,
    formatPrice, getEffectivePrice, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInWishlist, placeOrder,
    addProduct, bulkImportProducts, updateProduct, deleteProduct, updateOrderStatus, restoreData, subscribeStockNotification, showToast,
  }}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
