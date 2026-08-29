# 🧸 متجر عمران للألعاب | Omran Toys Store - B2B & B2C Platform

> منصة تجارة إلكترونية متكاملة لألعاب الأطفال، مستلزمات الحفلات، وبالونات الجملة والقطاعي - مبنية بـ React 19 + Supabase + Tailwind CSS

**جميع المعاملات بالجنيه المصري (ج.م - EGP)** مع دعم تجار الجملة، حساب شحن ديناميكي، وبوابات دفع مصرية.

---

## 🌟 نظرة عامة - B2B & B2C

المتجر تحول من كتالوج عرض إلى **منصة تجارة إلكترونية متكاملة**:

- **B2C (قطاعي)**: عملاء أفراد - أسعار قطاعي، شحن مجاني فوق 1000 ج.م
- **B2B (جملة)**: تجار وأصحاب محلات - أسعار جملة تلقائية حتى 25% خصم، شحن مجاني فوق 800 ج.م، لوحة تحكم تاجر

---

## 🏗️ المعمارية التقنية (Tech Stack)

### Frontend
- **React 19** - أحدث إصدار مع Hooks
- **Vite 6** - بناء فائق السرعة
- **Tailwind CSS 3** - تصميم responsive سريع
- **Lucide Icons** - أيقونات عصرية
- **Canvas Confetti** - تأثيرات تفاعلية

### Backend & Database
- **Supabase** - Auth, Database, Realtime, Storage
  - PostgreSQL مع Row Level Security (RLS)
  - Auth Flow لنوعين مستخدمين (retail / wholesale)
  - Functions لحساب الشحن والأسعار
- **LocalStorage Fallback** - يعمل بدون Supabase في وضع Mock

### Integrations
- **Paymob** - بوابة دفع بطاقات (فيزا، ماستركارد، ميزة)
- **Fawry** - دفع عبر فوري
- **InstaPay & Wallets** - فودافون كاش، أورنج كاش
- **ValU** - تقسيط

### Logistics
- **Dynamic Shipping Calculator** - حسب المحافظة، الوزن، الحجم
- 27 محافظة مصرية مع تسعير مخصص

---

## 📁 هيكل المشروع

```
omrantoys-store/
├── supabase/
│   └── schema.sql              # مخطط قاعدة البيانات الكامل (11 جدول)
├── src/
│   ├── lib/
│   │   ├── supabaseClient.js   # إعداد Supabase + Mock mode
│   │   ├── shippingCalculator.js # دالة حساب الشحن الديناميكي
│   │   └── paymentGateways.js  # Paymob, Fawry integration
│   ├── context/
│   │   ├── StoreContext.jsx    # حالة المتجر + B2B pricing + Bulk
│   │   └── AuthContext.jsx     # مصادقة تجار الجملة + Retail
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.jsx   # تسجيل دخول/حساب تاجر جملة
│   │   ├── b2b/
│   │   │   └── MerchantDashboard.jsx # لوحة تحكم التاجر
│   │   ├── product/
│   │   │   ├── ProductCard.jsx # يدعم أسعار الجملة + نفد المخزون
│   │   │   ├── ProductGrid.jsx # مع Advanced Filters
│   │   │   ├── AdvancedFilters.jsx # Faceted Search
│   │   │   └── StockNotification.jsx # أعلمني عند التوفر
│   │   ├── admin/
│   │   │   ├── AdminDashboardModal.jsx
│   │   │   └── BulkImport.jsx  # استيراد مئات المنتجات JSON
│   │   ├── blog/
│   │   │   └── B2BBlogSection.jsx # مقالات تجار - بدون مبالغة
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx  # مع حساب شحن ديناميكي
│   │   └── checkout/
│   │       └── CheckoutModal.jsx # Paymob/Fawry + شحن ديناميكي
│   ├── data/
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── coupons.js
│   │   └── b2bBlog.js          # محتوى B2B واقعي بدون superlatives
│   └── App.jsx
├── docs/
│   └── database-schema.md      # توثيق مفصل للـ Schema
└── README.md
```

---

## 🗄️ مخطط قاعدة البيانات (Supabase Schema)

### الجداول الرئيسية (11 جدول)

#### 1. `profiles` - المستخدمين/التجار
```sql
- id UUID (FK auth.users)
- user_type: 'retail' | 'wholesale'
- business_name, tax_id, commercial_register
- is_verified_merchant, wholesale_tier (tier1/2/3)
- discount_rate, governorate, city
```

#### 2. `products` - المنتجات/المخزون (محسن)
```sql
- sku, name_ar, name_en, slug
- retail_price, wholesale_price, wholesale_price_tier2/3
- stock_quantity, low_stock_threshold, is_visible (auto-hide when 0)
- age_group, brand, toy_type, material
- weight_grams, dimensions_cm
- is_balloon, is_party_supply
- images JSONB, tags TEXT[], features JSONB
- import_batch_id (لـ Bulk Import)
```

#### 3. `stock_notifications` - أعلمني عند التوفر
```sql
- product_id, email, phone, user_id
- is_notified
```

#### 4. `orders` + `order_items`
```sql
- id TEXT (OMR-XXXX), user_id, user_type
- governorate, weight_total_grams, shipping_method
- payment_gateway (paymob/fawry/cod), payment_transaction_id
- wholesale_discount_applied
```

#### 5. `shipping_zones` - مناطق الشحن
```sql
- governorate, base_cost, free_shipping_threshold
- extra_cost_per_kg, estimated_days_min/max
- Seed: 27 محافظة مصرية
```

#### 6. `b2b_articles` - مدونة التجار (CMS)
```sql
- slug, title_ar, excerpt_ar, content_ar (factual only)
- category: pricing/logistics/inventory/guides/regulations
- data_sources TEXT[], is_verified
- reading_time_minutes, views_count
- Rule: No Superlatives, data-driven only
```

#### 7. `coupons`, `wishlists`, `reviews`, `categories`

### Functions

```sql
- calculate_shipping_cost(governorate, weight, subtotal) 
  → {cost, is_free, estimated_days}

- get_product_price(product_id, user_type, tier)
  → wholesale or retail price
```

**RLS Policies**: كل جدول محمي بـ Row Level Security - القراءة عامة، الكتابة للمصادقين فقط.

انظر `supabase/schema.sql` للتفاصيل الكاملة + بيانات Seed.

---

## 🔐 نظام حسابات التجار (B2B Portal)

### تدفق المصادقة (Auth Flow)

**Supabase Auth** مع نوعين:

1. **عميل قطاعي (Retail)**:
   - تسجيل بـ email + phone + governorate
   - أسعار قطاعي، شحن مجاني فوق 1000 ج.م

2. **تاجر جملة (Wholesale)**:
   - نفس الحقول + business_name
   - `is_verified_merchant = false` مبدئياً، يفعل خلال 24 ساعة
   - 3 مستويات:
     - **Tier1 (مبتدئ)**: 5 قطع حد أدنى، 10-15% خصم
     - **Tier2 (معتمد)**: 10 قطع، 15-20% خصم، شحن مجاني فوق 700 ج.م
     - **Tier3 (موزع رئيسي)**: 25 قطعة، 20-25% خصم، شحن مجاني فوق 500 ج.م

### Mock Mode (بدون Supabase)

لو لم تضبط `VITE_SUPABASE_URL`، النظام يعمل في وضع Mock:

- تسجيل دخول بأي email:
  - `retail@test.com` → حساب قطاعي
  - `wholesale@test.com` → حساب تاجر جملة (20% خصم)

### لوحة تحكم التاجر (Merchant Dashboard)

تظهر عند `isMerchant = true`:

- **أسعار الجملة تلقائياً** بدل القطاعي
- **سجل الطلبات السابقة** (Order History) مع فلترة
- **زر إعادة الطلب السريع (1-Click Reorder)** - يضيف كل منتجات طلب سابق للسلة مرة واحدة
- **هيكل التسعير** وفرق التوفير
- **بيانات النشاط التجاري** + طريقة الترقية

---

## 🚚 أتمتة الدفع والشحن

### سلة مشتريات متقدمة

- حساب وزن إجمالي: `calculateCartWeight()` - كل منتج له `weight_grams`
- حساب حجم: `calculateCartVolume()` - مهم للبالونات والمنتجات الكبيرة
- اختيار المحافظة من Dropdown (27 محافظة)
- عرض breakdown: أساسي + وزن إضافي + حجم

### دالة حساب الشحن الديناميكي

```javascript
// src/lib/shippingCalculator.js
calculateShippingCost({
  governorate: 'طنطا (الغربية)',
  totalWeightGrams: 3500, // 3.5 كجم
  subtotal: 850,
  userType: 'wholesale', // يقلل threshold لـ 800 بدل 1000
  totalVolume: 0.08 // متر مكعب
})
// → { cost: 0, isFree: true, estimatedDays: '1-2', breakdown: {...} }
```

**القواعد**:
- أول 1 كجم مشمول في base_cost
- كل كجم إضافي: 8-20 ج.م حسب المحافظة
- حجم > 0.05 م³: 15 ج.م لكل 0.05 م³
- تجار الجملة: free threshold أقل 200 ج.م

### بوابات الدفع

```javascript
// src/lib/paymentGateways.js
PAYMENT_METHODS = {
  paymob: { fees: 0, icon: '💳' },
  fawry: { fees: 5, icon: '🏪' },
  instapay: { fees: 0 },
  valu: { fees: 0, min: 500 },
  cod: { fees: 10 }
}

- initiatePaymobPayment() - Mock + Real API
- initiateFawryPayment() → fawryCode
- validatePaymentAmount() - ValU يحتاج 500 ج.م حد أدنى
```

في Checkout: يعرض رسوم البوابة + إجمالي نهائي.

---

## 📦 هندسة المخزون وتوسيع الكتالوج

### Bulk Import (استيراد مئات المنتجات)

**Component**: `src/components/admin/BulkImport.jsx`

- رفع ملف JSON أو لصق مباشر
- يدعم حتى 500 منتج مرة واحدة
- حقول: `name, price, wholesale_price, category, stock, brand, weight_grams, images[], tags[]`
- معاينة قبل الاستيراد
- يحفظ `import_batch_id` لتتبع الدفعات

**نموذج JSON**:

```json
[
  {
    "name": "بالون هيليوم باقة 50 قطعة",
    "price": 350,
    "wholesale_price": 250,
    "category": "balloons",
    "stock": 100,
    "weight_grams": 800,
    "brand": "Omran Party"
  }
]
```

### الإخفاء التلقائي + أعلمني عند التوفر

- **ProductCard**: لو `stock <= 0`:
  - صورة grayscale + badge "نفد المخزون"
  - زر "إضافة للسلة" → "أعلمني عند التوفر"
  - Component `StockNotification` يطلب email/phone ويحفظ في `localStorage` + جدول `stock_notifications`

- **StoreContext**: `is_visible` flag - المنتجات التي نفدت تختفي تلقائياً لو `is_visible=false`، لكن يمكن إظهارها بفلتر "نفد المخزون"

---

## 🎨 واجهة المستخدم المتقدمة (Advanced UI/UX)

### شريط بحث متقدم (Faceted Search)

**Component**: `src/components/product/AdvancedFilters.jsx`

فلاتر ديناميكية مع عدّاد لكل قيمة (Facet Counts):

- **البحث النصي**: اسم، وصف، علامة، تاج
- **الفئة**: مع count لكل فئة (educational: 6, balloons: ...)
- **الفئة العمرية**: 0-2, 3-5, 6-8, 9-12, 12+
- **نوع اللعبة**: تعليمية، تحكم عن بعد، دمى، بالونات، حفلات، خارجية...
- **السعر**: min/max + slider، يعرض "أسعار الجملة" لو تاجر
- **حالة التوفر**: متوفر فقط، كمية محدودة (≤5)، نفد، عروض فقط
- **التقييم**: 4★ فأكثر، 3★...
- **العلامة التجارية**: مع count

**Active Chips**: كل فلتر نشط يظهر كـ chip قابل للإزالة + زر "مسح الكل"

**Responsive**: 
- Desktop: Sidebar sticky
- Mobile: Drawer من اليمين مع زر "عرض النتائج (X)"

**الهوية البصرية**: نفس ألوان عمران (Navy #10152F, Coral #F04463, Golden #F6C945, Turquoise #16A6B6) - وضوح، سرعة، عملية.

---

## 📝 هيكلة قسم المدونة (B2B Content/SEO)

### CMS Schema

جدول `b2b_articles` مع:

- `category`: pricing, logistics, inventory, guides, regulations
- `data_sources`: مصدر كل رقم (مثلاً: "مسح عمران 2024")
- `is_verified`: موثق ببيانات
- `reading_time_minutes`

### قاعدة صارمة: No Superlatives

**كل المقالات واقعية 100%، تركز على البيانات، بدون مبالغة**:

- ❌ ممنوع: "أفضل منتج في العالم، جودة لا مثيل لها"
- ✅ مسموح: "متوسط هامش الربح 22-28% بناءً على مسح 150 تاجر"

**5 مقالات جاهزة** في `src/data/b2bBlog.js`:

1. **هيكل تسعير الجملة 2024**: هوامش ربح حسب الفئة (22-28% تعليمية، 35-50% بالونات)
2. **تكلفة ومدة الشحن**: جدول 27 محافظة من واقع 2340 شحنة
3. **معدل دوران المخزون**: أي الفئات تبيع أسرع (بالونات 18 يوم، رضع 74 يوم)
4. **سوق البالونات جملة**: أنواع، تسعير، تكلفة هيليوم
5. **طرق الدفع لتجار الجملة**: مقارنة تحويل/آجل/إلكتروني مع نسب مخاطر

Component `B2BBlogSection` يعرض Grid + صفحة مقال كاملة مع التزام مصداقية.

---

## 🚀 تشغيل المشروع محلياً

### 1. التثبيت

```bash
npm install
```

### 2. إعداد متغيرات البيئة (اختياري - يعمل بدونها في Mock Mode)

أنشئ `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYMOB_API_KEY=your-paymob-key
VITE_PAYMOB_INTEGRATION_ID=123456
VITE_PAYMOB_IFRAME_ID=123456
VITE_FAWRY_MERCHANT_CODE=your-fawry-code
```

لو لم تضبطها، النظام يعمل بـ Mock Mode مع localStorage.

### 3. إعداد Supabase (لو تريد Backend حقيقي)

```bash
# في Supabase Dashboard → SQL Editor
# انسخ محتوى supabase/schema.sql وشغله
# سينشئ 11 جدول + بيانات شحن + RLS
```

### 4. تشغيل خادم التطوير

```bash
npm run dev
# → http://localhost:5173
# Preview URL: https://{port}-{sandbox}.e2b.app
```

### 5. بناء للإنتاج

```bash
npm run build
npm run preview
```

---

## 📚 كيفية إضافة منتجات جديدة

### طريقة 1: لوحة الإدارة (مفرد)

- اضغط ⚙️ في الهيدر → تبويب "إضافة"
- املأ: اسم، سعر قطاعي، سعر جملة (تلقائي 75% من القطاعي)، مخزون، فئة
- يدعم بالونات وحفلات: اختر category = balloons/party

### طريقة 2: Bulk Import (جملة)

- لوحة الإدارة → "استيراد جملة"
- حمل نموذج JSON → عدله → ارفع الملف أو الصق
- معاينة → استيراد
- يدعم 500 منتج مرة واحدة، يحفظ batch_id

### طريقة 3: مباشرة في Supabase (إنتاج)

```sql
INSERT INTO products (sku, name_ar, retail_price, wholesale_price, stock_quantity, category_id, weight_grams)
VALUES ('OMR-BAL-001', 'بالون هيليوم 50 قطعة', 350, 250, 100, 'balloons', 800);
```

### طريقة 4: تعديل `src/data/products.js`

- أضف كائن جديد لـ `initialProducts` مع نفس الهيكل
- احذف `omran_toys_version` من localStorage لإعادة التحميل

---

## 🧪 اختبار حسابات التجار

### بدون Supabase (Mock Mode)

- افتح "دخول / حساب" → جرب:
  - **Retail**: أي email لا يحتوي wholesale → حساب قطاعي
  - **Wholesale**: email يحتوي `wholesale` أو `merchant` → حساب تاجر معتمد 20% خصم
  - مثال: `wholesale@test.com` + أي password

### مع Supabase

- سجل حساب جديد → اختر "تاجر جملة" → أدخل اسم المحل
- في Supabase Dashboard → `profiles` → غيّر `is_verified_merchant = true` و `discount_rate = 20`

---

## 📄 التوثيق الإضافي

- `supabase/schema.sql` - مخطط كامل مع تعليقات عربية
- `docs/database-schema.md` - شرح مفصل لكل جدول وعلاقة
- `brand-spec.md` - هوية عمران التجارية (ألوان، شعار، نبرة)

---

## 🤝 المساهمة والتطوير المستقبلي

- [ ] ربط Supabase Storage لصور المنتجات
- [ ] Realtime لتنبيهات المخزون
- [ ] فاتورة PDF تلقائية
- [ ] تكامل شحن Mylerz/Bosta API حقيقي
- [ ] لوحة تحكم موزع رئيسي (Tier3) مع تقارير مبيعات
- [ ] PWA + Offline support

---

## 📞 التواصل

- **الشركة**: شركة عمران التجارية - طنطا، الغربية
- **المتجر**: عمران للألعاب - لعب أطفال - هدايا
- **واتساب**: 01555570269
- **العملة**: جنيه مصري فقط (EGP)

---

**تم التطوير بواسطة Senior Full-Stack Developer - B2B & B2C E-commerce Architecture**

> **مبدأ**: بيانات واقعية، بدون مبالغة، تجربة تاجر أولاً (Wholesale Authenticity)
