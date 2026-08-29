import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProducts, sampleReviews } from '../data/products';
import { currencies } from '../data/categories';
import { validCoupons } from '../data/coupons';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Products with local storage persistence for admin additions/edits
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist (array of IDs)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_wishlist');
      return saved ? JSON.parse(saved) : [1, 5];
    } catch {
      return [1, 5];
    }
  });

  // Currency
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('omran_toys_currency') || 'SAR';
    } catch {
      return 'SAR';
    }
  });

  // Orders
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_orders');
      return saved ? JSON.parse(saved) : [
        {
          id: 'OMR-8842',
          date: '2026-08-27',
          customerName: 'فهد السالم',
          phone: '0551234567',
          city: 'الرياض',
          address: 'حي النرجس، شارع أنس بن مالك',
          status: 'تم الشحن',
          items: [
            { id: 1, name: 'روبوت الذكاء الاصطناعي التفاعلي كوزمو', price: 349, quantity: 1 }
          ],
          subtotal: 349,
          shipping: 0,
          discount: 34.9,
          vat: 47.11,
          total: 361.21,
          giftWrap: true,
          giftMessage: 'كل عام وأنت بألف خير يا بطل!',
          paymentMethod: 'الدفع عند الاستلام'
        }
      ];
    } catch {
      return [];
    }
  });

  // Reviews
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('omran_toys_reviews');
      return saved ? JSON.parse(saved) : sampleReviews;
    } catch {
      return sampleReviews;
    }
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Applied Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isGiftFinderOpen, setIsGiftFinderOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('omran_toys_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('omran_toys_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('omran_toys_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('omran_toys_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('omran_toys_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('omran_toys_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Price formatter with selected currency
  const formatPrice = (amountInSAR) => {
    const curr = currencies[currency] || currencies.SAR;
    const converted = (amountInSAR * curr.rate).toFixed(curr.symbol === 'د.ك' ? 2 : 0);
    return `${converted} ${curr.symbol}`;
  };

  // Cart actions
  const addToCart = (product, quantity = 1, options = {}) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          giftWrap: options.giftWrap ?? updated[existingIndex].giftWrap
        };
        return updated;
      } else {
        return [...prev, { product, quantity, giftWrap: options.giftWrap || false }];
      }
    });
    showToast(`تمت إضافة "${product.name}" إلى السلة بنجاح! 🛍️`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('تم حذف المنتج من السلة', 'info');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleGiftWrap = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, giftWrap: !item.giftWrap } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist actions
  const toggleWishlist = (productId) => {
    const product = products.find(p => p.id === productId);
    const title = product ? product.name : 'المنتج';

    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast(`تمت إزالة "${title}" من المفضلة`, 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast(`تمت إضافة "${title}" إلى قائمة أمنياتك! ❤️`);
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping threshold: 250 SAR or with FREESHIP coupon
  const isFreeShipping =
    cartSubtotal >= 250 ||
    (appliedCoupon && appliedCoupon.code === 'FREESHIP') ||
    cartSubtotal === 0;

  const shippingCost = cartSubtotal === 0 ? 0 : isFreeShipping ? 0 : 25;

  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal > 0) {
    if (appliedCoupon.discountPercent > 0) {
      discountAmount = (cartSubtotal * appliedCoupon.discountPercent) / 100;
    }
  }

  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  // VAT 15% calculation (Saudi standard)
  const vatAmount = (taxableAmount * 0.15);
  const cartTotal = taxableAmount + shippingCost;

  // Coupon handling
  const applyCouponCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    const found = validCoupons.find(c => c.code === cleanCode);
    if (!found) {
      showToast('كوبون الخصم غير صالح أو منتهي الصلاحية!', 'error');
      return false;
    }
    if (cartSubtotal < found.minSpend) {
      showToast(`الحد الأدنى لتفعيل هذا الكوبون هو ${found.minSpend} ر.س`, 'error');
      return false;
    }
    setAppliedCoupon(found);
    showToast(`تم تفعيل كوبون الخصم (${found.code}) بنجاح! 🎉`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('تمت إزالة الكوبون', 'info');
  };

  // Place Order
  const placeOrder = (orderData) => {
    const newOrder = {
      id: `OMR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        giftWrap: item.giftWrap,
        image: item.product.images[0]
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingCost,
      vat: vatAmount,
      total: cartTotal,
      couponUsed: appliedCoupon ? appliedCoupon.code : null,
      status: 'قيد الانتظار',
      ...orderData
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    setAppliedCoupon(null);
    return newOrder;
  };

  // Add review
  const addReview = (productId, reviewData) => {
    const newRev = {
      id: Date.now(),
      productId,
      date: 'الآن',
      verified: true,
      ...reviewData
    };
    setReviews(prev => [newRev, ...prev]);

    // update product rating & reviewsCount
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newCount = p.reviewsCount + 1;
          const newRating = Number(
            ((p.rating * p.reviewsCount + reviewData.rating) / newCount).toFixed(1)
          );
          return { ...p, rating: newRating, reviewsCount: newCount };
        }
        return p;
      })
    );
    showToast('شكراً لك! تمت إضافة تقييمك بنجاح ⭐');
  };

  // Admin Actions
  const addProduct = (newProduct) => {
    const productWithDefaults = {
      id: Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      isBestSeller: false,
      isFeatured: false,
      sku: `OMR-${Math.floor(100 + Math.random() * 900)}`,
      features: newProduct.features || ['لعبة مسلية وآمنة للأطفال', 'خامات عالية الجودة'],
      images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
      ],
      ...newProduct
    };
    setProducts(prev => [productWithDefaults, ...prev]);
    showToast('تمت إضافة المنتج الجديد بنجاح إلى متجر عمران! 🚀');
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    showToast('تم تحديث بيانات المنتج بنجاح');
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('تم حذف المنتج بنجاح', 'info');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`تم تحديث حالة الطلب #${orderId} إلى: ${newStatus}`);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        currency,
        orders,
        reviews,
        searchQuery,
        selectedCategory,
        selectedAgeGroup,
        priceRange,
        sortBy,
        inStockOnly,
        onSaleOnly,
        appliedCoupon,
        cartSubtotal,
        totalItemsCount,
        isFreeShipping,
        shippingCost,
        discountAmount,
        vatAmount,
        cartTotal,
        isCartOpen,
        isCheckoutOpen,
        isWishlistOpen,
        isGiftFinderOpen,
        isAdminOpen,
        isTrackingOpen,
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
        setIsGiftFinderOpen,
        setIsAdminOpen,
        setIsTrackingOpen,
        setSelectedProductModal,
        setLastPlacedOrder,
        setCurrency,
        // Handlers
        formatPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleGiftWrap,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCouponCode,
        removeCoupon,
        placeOrder,
        addReview,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
