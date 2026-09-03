/**
 * ⚠️ ARCHIVE ONLY — ليس مصدر عرض.
 * الكتالوج المعروض يأتي حصريًا من Product Engine (/api/products ← Google Sheet)
 * عبر src/lib/productEngine.js + StoreContext. هذه البيانات التاريخية (SKU/stock/
 * عمر/ماركة/أبعاد مُفترضة) لا تُعرض للزائر ولا تُستخدم fallback (Fail-Closed).
 * تُحفظ كمرجع للتحقق فقط — لا تعديل هنا إلا بإشراف موثّق.
 */
export const initialProducts = [
  {
    id: 1001,
    name: 'مطبخ ألعاب للأطفال — 46 قطعة',
    nameEn: 'Kids Kitchen Play Set — 46 Pieces',
    category: 'dolls-figures',
    price: 850,
    originalPrice: 0,
    discountPercent: 0,
    stock: 12,
    ageGroup: '3-5',
    brand: 'Omran Toys',
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    sku: 'OMR-IG-KIT-46',
    description: 'مطبخ أطفال كامل بأدوات وأواني وإكسسوارات كتير للعب التخيلي، مناسب للبنات والأولاد.',
    features: ['46 قطعة متنوعة', 'أدوات وأواني للعب التخيلي', 'ألوان جذابة وتصميم لطيف', 'مناسب من عمر 3 سنوات'],
    dimensions: 'حسب العبوة',
    batteryRequired: 'غير مطلوب',
    safetyNotice: 'يستخدم تحت إشراف الكبار حسب العمر الموصى به',
    images: ['/imported/omran-product-01.png'],
    tags: ['مطبخ', 'لعب تمثيلي', 'هدايا', 'أطفال']
  },
  {
    id: 1002,
    name: 'لعبة الاسكوشي بأشكال وألوان متنوعة',
    nameEn: 'Squishy Stress Relief Toy',
    category: 'arts-crafts',
    price: 275,
    originalPrice: 0,
    discountPercent: 0,
    stock: 30,
    ageGroup: '3-5',
    brand: 'Omran Toys',
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    sku: 'OMR-IG-SQ-01',
    description: 'لعبة ناعمة ولطيفة للتسلية وتفريغ الطاقة، تنفع كهدية حلوة للأطفال والكبار.',
    features: ['خامة ناعمة', 'أشكال وألوان متنوعة', 'سهلة الحمل والتسلية', 'مناسبة للهدايا'],
    dimensions: 'أحجام متنوعة',
    batteryRequired: 'غير مطلوب',
    safetyNotice: 'غير مناسبة للأطفال أقل من 3 سنوات لاحتوائها على أجزاء صغيرة',
    images: ['/imported/omran-product-02.png'],
    tags: ['اسكوشي', 'تسلية', 'هدايا', 'ألوان']
  },
  {
    id: 1003,
    name: 'مطبخ Home Chef للأطفال — 104 قطعة',
    nameEn: 'Home Chef Kids Kitchen — 104 Pieces',
    category: 'dolls-figures',
    price: 1850,
    originalPrice: 0,
    discountPercent: 0,
    stock: 8,
    ageGroup: '3-5',
    brand: 'Omran Toys',
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    sku: 'OMR-IG-HC-104',
    description: 'مطبخ لعب واقعي جدًا بإضاءة وأصوات وملحقات كتير، مناسب للأطفال من 3 سنين.',
    features: ['104 قطعة وإكسسوار', 'إضاءة وأصوات تفاعلية', 'تصميم لعب واقعي', 'مناسب من عمر 3 سنوات'],
    dimensions: '101.5 × 54 × 20 سم',
    batteryRequired: 'حسب المنتج',
    safetyNotice: 'يستخدم تحت إشراف الكبار حسب العمر الموصى به',
    images: ['/imported/omran-product-03.png'],
    tags: ['مطبخ', 'لعب تمثيلي', 'إضاءة', 'هدايا']
  }
];

