/* =========================================================
   شركة عمران التجارية — كتالوج الجملة (B2B)
   جميع الأسعار بالجنيه المصري (جملة/وحدة)
   ========================================================= */
window.OMRAN_B2B = {
  /* أدنى قيمة للطلب (جملة) */
  MIN_ORDER_VALUE: 5000,
  CURRENCY: 'ج.م',

  /* فئات كتالوج الجملة (مطابقة لفئات متجر التجزئة) */
  CATEGORIES: {
    'educational': 'تعليمية وذكاء STEM',
    'building': 'مكعبات وبناء',
    'rc-electronic': 'تحكم عن بعد وروبوتات',
    'dolls-figures': 'دمى وشخصيات أبطال',
    'board-games': 'ألعاب لوحية',
    'outdoor': 'ألعاب خارجية',
    'infant': 'ألعاب رضّع',
    'arts-crafts': 'فنون وحرف',
  },

  /* unitPrice: سعر الجملة للوحدة | cartonSize: عدد الوحدات بالصندوق
     minCartons: أدنى طلب بالصناديق | stockCartons: المخزون المتاح (صناديق) */
  PRODUCTS: [
    { sku: 'OMR-BOT-01', name: 'روبوت الذكاء الاصطناعي التفاعلي كوزمو', category: 'rc-electronic', unitPrice: 1650, cartonSize: 12, minCartons: 2, stockCartons: 24 },
    { sku: 'OMR-BLD-02', name: 'طقم استكشاف الفضاء ومكوك ناسا 1200 قطعة', category: 'building', unitPrice: 1300, cartonSize: 6, minCartons: 2, stockCartons: 18 },
    { sku: 'OMR-SCI-03', name: 'مجهر العلوم الرقمي المحمول مع 100 شريحة', category: 'educational', unitPrice: 875, cartonSize: 12, minCartons: 2, stockCartons: 30 },
    { sku: 'OMR-DRN-04', name: 'درون ميني RC مع كاميرا HD', category: 'rc-electronic', unitPrice: 1150, cartonSize: 8, minCartons: 3, stockCartons: 0 },
    { sku: 'OMR-DMH-05', name: 'دمية باربي — أزياء ملكية', category: 'dolls-figures', unitPrice: 320, cartonSize: 24, minCartons: 5, stockCartons: 40 },
    { sku: 'OMR-FGR-06', name: 'طقم شخصيات أبطال (6 مجسمات)', category: 'dolls-figures', unitPrice: 450, cartonSize: 18, minCartons: 4, stockCartons: 26 },
    { sku: 'OMR-GRF-07', name: 'ألعاب بناء خشبية — 500 قطعة', category: 'building', unitPrice: 780, cartonSize: 10, minCartons: 3, stockCartons: 35 },
    { sku: 'OMR-EDU-08', name: 'طقم علوم الكيمياء للأطفال — 40 تجربة', category: 'educational', unitPrice: 620, cartonSize: 12, minCartons: 3, stockCartons: 22 },
    { sku: 'OMR-BSK-09', name: 'مكعبات بناء مغناطيسية — 120 قطعة', category: 'building', unitPrice: 990, cartonSize: 10, minCartons: 2, stockCartons: 28 },
    { sku: 'OMR-BRD-10', name: 'شطرنج خشبي احترافي مع ساعة', category: 'board-games', unitPrice: 540, cartonSize: 16, minCartons: 4, stockCartons: 32 },
    { sku: 'OMR-BRD-11', name: 'ألعاب لوحية تعليمية (4 ألعاب في 1)', category: 'board-games', unitPrice: 380, cartonSize: 20, minCartons: 5, stockCartons: 45 },
    { sku: 'OMR-OUT-12', name: 'طقم هوكي هواء للأطفال', category: 'outdoor', unitPrice: 290, cartonSize: 24, minCartons: 6, stockCartons: 38 },
    { sku: 'OMR-OUT-13', name: 'سكوتر LED مضيء للأطفال', category: 'outdoor', unitPrice: 350, cartonSize: 20, minCartons: 5, stockCartons: 0 },
    { sku: 'OMR-INF-14', name: 'رنغز موسيقية للرضّع', category: 'infant', unitPrice: 260, cartonSize: 24, minCartons: 6, stockCartons: 50 },
    { sku: 'OMR-ART-15', name: 'طقم رسم ولوحات فنية — 48 قطعة', category: 'arts-crafts', unitPrice: 310, cartonSize: 18, minCartons: 4, stockCartons: 33 },
    { sku: 'OMR-RCV-16', name: 'سيارة دريفت 1:16 — تحكم عن بعد', category: 'rc-electronic', unitPrice: 890, cartonSize: 12, minCartons: 3, stockCartons: 15 },
  ],
};
