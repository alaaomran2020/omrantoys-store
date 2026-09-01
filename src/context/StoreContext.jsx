import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialProducts } from '../data/products';
import { calculateShippingCost, calculateCartWeight, calculateCartVolume } from '../lib/shippingCalculator';
import { track, EVENTS } from '../lib/analytics';
import { getSettings } from '../lib/settings';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Products with local storage persistence
  const [products, setProducts] = useState(() => {
    try {
      const storedVersion = localStorage.getItem('omran_toys_version');
      if (storedVersion !== 'egp-v2-b2b') {
        localStorage.setItem('omran_toys_version', 'egp-v2-b2b');
        // Enhance initial products with wholesale pricing
        const enhanced = initialProducts.map(p => ({
          ...p,
          retail_price: p.price,
          wholesale_price: p.wholesale_price || Math.round(p.price * 0.75),
          wholesale_price_tier2: p.wholesale_price_tier2 || Math.round(p.price * 0.7),
          wholesale_price_tier3: p.wholesale_price_tier3 || Math.round(p.price * 0.65),
          weight_grams: p.weight_grams || 500,
          toy_type: p.toy_type || p.category,
          is_visible: p.stock > 0 ? true : p.is_visible !== false,
        }));
        localStorage.setItem('omran_toys_products', JSON.stringify(enhanced));
        localStorage.setItem('omran_toys_currency', 'EGP');
        return enhanced;
      }
      const saved = localStorage.getItem('omran_toys_products');
      if (!saved) return initialProducts;
      const savedProducts = JSON.parse(saved);
      const savedIds = new Set(savedProducts.map(product => product.id));
      const enhancedInitial = initialProducts.map(p => ({
        ...p,
        retail_price: p.price,
        wholesale_price: p.wholesale_price || Math.round(p.price * 0.75),
        wholesale_price_tier2: p.wholesale_price_tier2 || Math.round(p.price * 0.7),
        wholesale_price_tier3: p.wholesale_price_tier3 || Math.round(p.price * 0.65),
        weight_grams: p.weight_grams || 500,
        toy_type: p.toy_type || p.category,
      }));
      return [
        ...enhancedInitial.filter(product => !savedIds.has(product.id)),
        ...savedProducts
      ];
    } catch {
      return initialProducts;
    }
  });

  // Cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Currency
  const currency = 'EGP';

  // Orders
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Stock notifications
  const [stockNotifications, setStockNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_stock_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Advanced Filters (Faceted Search)
  const [advancedFilters, setAdvancedFilters] = useState({
    search: '',
    category: 'all',
    ageGroup: 'all',
    toyType: 'all',
    brand: 'all',
    availability: 'all',
    priceMin: 0,
    priceMax: 2500,
  });

  // Legacy filters for compatibility
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [priceRange, setPriceRange] = useState(2500);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Shipping
  const [selectedGovernorate, setSelectedGovernorate] = useState('طنطا (الغربية)');
  const [userTypeForShipping, setUserTypeForShipping] = useState('retail');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync localStorage
  useEffect(() => { localStorage.setItem('omran_toys_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('omran_toys_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('omran_toys_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('omran_toys_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('omran_stock_notifications', JSON.stringify(stockNotifications)); }, [stockNotifications]);

  // Sync legacy search to advanced
  useEffect(() => {
    if (searchQuery !== advancedFilters.search) {
      setAdvancedFilters(f => ({ ...f, search: searchQuery }));
    }
  }, [searchQuery]);
  useEffect(() => {
    if (selectedCategory !== advancedFilters.category) {
      setAdvancedFilters(f => ({ ...f, category: selectedCategory }));
    }
  }, [selectedCategory]);
  useEffect(() => {
    if (selectedAgeGroup !== advancedFilters.ageGroup) {
      setAdvancedFilters(f => ({ ...f, ageGroup: selectedAgeGroup }));
    }
  }, [selectedAgeGroup]);

  const formatPrice = (amount) => {
    const num = Math.round(Number(amount) || 0);
    return `${num.toLocaleString('en-US')} ج.م`;
  };

  // سعر موحد لكل العملاء
  const getEffectivePrice = (product) => {
    if (!product) return 0;
    return product.price || product.retail_price || 0;
  };

  // Cart actions with stock check
  const addToCart = (product, quantity = 1) => {
    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    const stockLimit = Number(product.stock) > 0 ? Number(product.stock) : 0;
    
    if (stockLimit === 0) {
      showToast(`"${product.name}" غير متوفر حالياً - يمكنك تفعيل تنبيه عند التوفر`, 'info');
      return;
    }

    let addedQuantity = requestedQuantity;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      const currentQuantity = existingIndex > -1 ? prev[existingIndex].quantity : 0;
      addedQuantity = Math.min(requestedQuantity, Math.max(0, stockLimit - currentQuantity));
      if (addedQuantity <= 0) return prev;
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQuantity + addedQuantity
        };
        return updated;
      }
      return [...prev, { product, quantity: addedQuantity }];
    });

    if (addedQuantity < requestedQuantity) {
      showToast(`تمت إضافة الكمية المتاحة فقط من "${product.name}"`, 'info');
    } else {
      showToast(`تمت إضافة "${product.name}" إلى السلة 🛍️`);
    }
    track(EVENTS.addToCart, { productId: product.id, name: product.name, quantity: addedQuantity });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('تم حذف المنتج من السلة', 'info');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item;
      const stockLimit = Number(item.product.stock) > 0 ? Number(item.product.stock) : Number(item.product.stock_quantity) || Infinity;
      return { ...item, quantity: Math.min(Number(newQuantity), stockLimit) };
    }));
  };

  const clearCart = () => setCart([]);

  // Wishlist
  const toggleWishlist = (productId) => {
    const product = products.find(p => p.id === productId);
    const title = product ? product.name : 'المنتج';
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast(`تمت إزالة "${title}" من المفضلة`, 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast(`تمت إضافة "${title}" إلى المفضلة ❤️`);
        return [...prev, productId];
      }
    });
  };
  const isInWishlist = (productId) => wishlist.includes(productId);

  // Shipping calculation
  const shippingCalculation = useMemo(() => {
    const weight = calculateCartWeight(cart);
    const volume = calculateCartVolume(cart);
    const subtotal = cart.reduce((sum, item) => {
      // Use retail for shipping calc base, will adjust with wholesale later
      return sum + (item.product.price || item.product.retail_price || 0) * item.quantity;
    }, 0);
    return calculateShippingCost({
      governorate: selectedGovernorate,
      totalWeightGrams: weight,
      subtotal,
      userType: userTypeForShipping,
      totalVolume: volume,
    });
  }, [cart, selectedGovernorate, userTypeForShipping]);

  // Cart calculations with wholesale support
  const cartSubtotalRetail = cart.reduce((sum, item) => sum + (item.product.price || item.product.retail_price || 0) * item.quantity, 0);
  
  // For display, cartSubtotal is retail, but we also compute wholesale if needed
  const cartSubtotal = cartSubtotalRetail;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = 1000;
  const isFreeShipping = shippingCalculation.isFree || cartSubtotal >= freeShippingThreshold || cartSubtotal === 0;
  const shippingCost = cartSubtotal === 0 ? 0 : isFreeShipping ? 0 : shippingCalculation.cost;

  const discountAmount = 0;

  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const vatAmount = taxableAmount * 0.14;
  const cartTotal = taxableAmount + shippingCost;

  // Place order with enhanced data
  const placeOrder = (orderData) => {
    const weight = calculateCartWeight(cart);
    const newOrder = {
      id: `OMR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price || item.product.retail_price,
        wholesale_price: item.product.wholesale_price,
        quantity: item.quantity,
        image: item.product.images[0],
        sku: item.product.sku,
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingCost,
      shipping_breakdown: shippingCalculation.breakdown,
      vat: vatAmount,
      total: cartTotal,
      status: 'قيد الانتظار',
      weight_total_grams: weight,
      estimated_delivery: shippingCalculation.estimatedDays,
      user_type: orderData.user_type || userTypeForShipping,
      wholesale_discount_applied: orderData.wholesale_discount || 0,
      ...orderData
    };
    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    track(EVENTS.orderPlaced, { orderId: newOrder.id, total: cartTotal });

    // Update product stock
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, (p.stock || 0) - cartItem.quantity) };
      }
      return p;
    }));

    return newOrder;
  };

  // Admin & Inventory
  const addProduct = (newProduct) => {
    const productWithDefaults = {
      id: Date.now(),
      isNew: true,
      isBestSeller: false,
      isFeatured: false,
      sku: `OMR-${Math.floor(100 + Math.random() * 900)}`,
      features: newProduct.features || ['لعبة مسلية وآمنة'],
      images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'],
      retail_price: newProduct.price,
      wholesale_price: newProduct.wholesale_price || Math.round(newProduct.price * 0.75),
      wholesale_price_tier2: Math.round(newProduct.price * 0.7),
      wholesale_price_tier3: Math.round(newProduct.price * 0.65),
      weight_grams: newProduct.weight_grams || 500,
      toy_type: newProduct.toy_type || newProduct.category,
      is_visible: true,
      ...newProduct
    };
    setProducts(prev => [productWithDefaults, ...prev]);
    showToast('تمت إضافة المنتج 🚀');
  };

  const bulkImportProducts = (productsArray) => {
    setProducts(prev => [...productsArray, ...prev]);
    showToast(`تم استيراد ${productsArray.length} منتج بنجاح!`);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? { ...p, ...updatedProduct, retail_price: updatedProduct.price || updatedProduct.retail_price } : p)));
    showToast('تم تحديث المنتج');
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('تم حذف المنتج', 'info');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
    showToast(`تم تحديث حالة الطلب #${orderId} إلى: ${newStatus}`);
  };

  // استعادة نسخة احتياطية (منتجات + طلبات)
  const restoreData = ({ products: newProducts, orders: newOrders }) => {
    if (Array.isArray(newProducts)) setProducts(newProducts);
    if (Array.isArray(newOrders)) setOrders(newOrders);
    showToast('تمت استعادة النسخة الاحتياطية');
  };

  // Stock notification
  const subscribeStockNotification = (productId, contactInfo) => {
    const newNotif = {
      id: Date.now(),
      product_id: productId,
      ...contactInfo,
      created_at: new Date().toISOString(),
    };
    setStockNotifications(prev => [...prev, newNotif]);
    showToast('تم تسجيل طلب التنبيه عند التوفر 🔔');
    return true;
  };

  // Filtered products using advanced filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Visibility: hide out of stock if not showing
      if (product.is_visible === false) return false;

      // Search
      if (advancedFilters.search.trim() !== '') {
        const q = advancedFilters.search.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchBrand = product.brand && product.brand.toLowerCase().includes(q);
        const matchTags = product.tags && product.tags.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchBrand && !matchTags) return false;
      }

      // Category
      if (advancedFilters.category !== 'all' && product.category !== advancedFilters.category) return false;

      // Age Group
      if (advancedFilters.ageGroup !== 'all' && product.ageGroup !== advancedFilters.ageGroup) return false;

      // Toy Type
      if (advancedFilters.toyType !== 'all') {
        const pType = product.toy_type || product.category;
        if (pType !== advancedFilters.toyType) {
          // Map some types
          if (advancedFilters.toyType === 'balloon' && !product.is_balloon && product.category !== 'balloons') return false;
          if (advancedFilters.toyType === 'party' && !product.is_party_supply && product.category !== 'party') return false;
          if (advancedFilters.toyType !== 'balloon' && advancedFilters.toyType !== 'party' && pType !== advancedFilters.toyType) {
            // Fallback check category contains
            if (!product.category.includes(advancedFilters.toyType) && pType !== advancedFilters.toyType) return false;
          }
        }
      }

      // Brand
      if (advancedFilters.brand !== 'all' && product.brand !== advancedFilters.brand) return false;

      // Price
      const price = product.price || product.retail_price || 0;
      if (price < advancedFilters.priceMin || price > advancedFilters.priceMax) return false;

      // Availability
      if (advancedFilters.availability === 'in_stock' && (product.stock || 0) <= 5) return false;
      if (advancedFilters.availability === 'low_stock' && ((product.stock || 0) > 5 || (product.stock || 0) === 0)) return false;
      if (advancedFilters.availability === 'out_of_stock' && (product.stock || 0) > 0) return false;
      if (advancedFilters.availability === 'on_sale' && (!product.discountPercent || product.discountPercent <= 0)) return false;

      // Legacy toggles
      if (inStockOnly && product.stock <= 0) return false;
      if (onSaleOnly && (!product.discountPercent || product.discountPercent <= 0)) return false;

      return true;
    });
  }, [products, advancedFilters, inStockOnly, onSaleOnly]);

  return (
    <StoreContext.Provider
      value={{
        products,
        filteredProducts,
        cart,
        wishlist,
        currency,
        orders,
        stockNotifications,
        // Filters
        searchQuery,
        selectedCategory,
        selectedAgeGroup,
        priceRange,
        sortBy,
        inStockOnly,
        onSaleOnly,
        advancedFilters,
        setAdvancedFilters,
        // Shipping
        selectedGovernorate,
        setSelectedGovernorate,
        userTypeForShipping,
        setUserTypeForShipping,
        shippingCalculation,
        // Cart totals
        cartSubtotal,
        cartSubtotalRetail,
        totalItemsCount,
        freeShippingThreshold,
        isFreeShipping,
        shippingCost,
        discountAmount,
        vatAmount,
        cartTotal,
        // Modals
        isCartOpen,
        isCheckoutOpen,
        isWishlistOpen,
        isAdminOpen,
        isTrackingOpen,
        isSignupOpen,
        selectedProductModal,
        lastPlacedOrder,
        toast,
        // Setters
        setSearchQuery,
        setSelectedCategory,
        setSelectedAgeGroup,
        setPriceRange,
        setSortBy,
        setInStockOnly,
        setOnSaleOnly,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsWishlistOpen,
        setIsAdminOpen,
        setIsTrackingOpen,
        setIsSignupOpen,
        setSelectedProductModal,
        setLastPlacedOrder,
        // Handlers
        formatPrice,
        getEffectivePrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        placeOrder,
        addProduct,
        bulkImportProducts,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        restoreData,
        subscribeStockNotification,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
