# 🧸 متجر عمران للألعاب | Omran Toys Store

> متجر تجارة إلكترونية لألعاب الأطفال ومستلزمات الحفلات - مبني بـ React 19 + Supabase + Tailwind CSS

**جميع المعاملات بالجنيه المصري (ج.م - EGP)** مع حساب شحن ديناميكي، وبوابات دفع مصرية.

---

## 🌟 نظرة عامة

متجر بيع قطاعي مباشر للعملاء داخل مصر:

- أسعار موحدة بالجنيه المصري لكل العملاء - شحن مجاني فوق 1,000 ج.م
- **نموذج تسجيل سريع** للزائر (الاسم + رقم الموبايل + حساب الفيسبوك) مقابل كود خصم ترحيبي `OMRAN10`
- لا يوجد تسجيل دخول ولا حسابات تجار - الطلب يتأكد عبر واتساب

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
│   │   ├── StoreContext.jsx    # حالة المتجر + السلة + الشحن + Bulk
│   │   └── AuthContext.jsx     # بيانات العميل المسجل (LocalStorage + leads)
│   ├── components/
│   │   ├── common/
│   │   │   └── CustomerSignupModal.jsx # نموذج تسجيل العميل (اسم/موبايل/فيسبوك)
│   │   ├── layout/
│   │   │   └── MobileBottomNav.jsx # شريط تنقل سفلي للموبايل
│   │   ├── product/
│   │   │   ├── ProductCard.jsx # بطاقة المنتج + نفد المخزون
│   │   │   ├── ProductGrid.jsx # مع Advanced Filters
│   │   │   ├── AdvancedFilters.jsx # Faceted Search
│   │   │   └── StockNotification.jsx # أعلمني عند التوفر
│   │   ├── admin/
│   │   │   ├── AdminDashboardModal.jsx
│   │   │   └── BulkImport.jsx  # استيراد مئات المنتجات JSON
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx  # مع حساب شحن ديناميكي
│   │   └── checkout/
│   │       └── CheckoutModal.jsx # Paymob/Fawry + شحن ديناميكي
│   ├── data/
│   │   ├── products.js
│   │   ├── categories.js
│   │   └── coupons.js
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

#### 6. `leads` - بيانات العملاء المسجلين
```sql
- full_name, phone (بصيغة دولية), facebook
- source: website-signup
- created_at
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

## 📝 نموذج تسجيل العميل (Leads)

### التدفق
1. عند أول زيارة للموقع يظهر نموذج تسجيل بعد ثانيتين (مرة واحدة فقط).
2. الحقول المطلوبة: **الاسم بالكامل** + **رقم الموبايل** (تحقق من رقم مصري 01XXXXXXXXX) + **حساب الفيسبوك**.
3. بعد التسجيل يُفعّل كود الخصم الترحيبي `OMRAN10` (10%) تلقائياً على السلة.
4. تُحفظ البيانات في `localStorage` تحت `omran_customer` وتُستخدم لتعبئة بيانات إتمام الطلب تلقائياً.
5. لو Supabase مُعدّ، تُحفظ أيضاً في جدول `leads` (انظر `docs/database-schema.md` - القسم 12).

> لا يوجد تسجيل دخول بكلمات مرور ولا حسابات تجار جملة - كل الأسعار قطاعية موحدة.


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
- **السعر**: min/max + slider بالجنيه المصري
- **حالة التوفر**: متوفر فقط، كمية محدودة (≤5)، نفد، عروض فقط
- **التقييم**: 4★ فأكثر، 3★...
- **العلامة التجارية**: مع count

**Active Chips**: كل فلتر نشط يظهر كـ chip قابل للإزالة + زر "مسح الكل"

**Responsive**: 
- Desktop: Sidebar sticky
- Mobile: Drawer من اليمين مع زر "عرض النتائج (X)"

**الهوية البصرية**: نفس ألوان عمران (Navy #10152F, Coral #F04463, Golden #F6C945, Turquoise #16A6B6) - وضوح، سرعة، عملية.

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

## ☁️ النشر على Cloudflare (Workers + Static Assets + D1)

المشروع مهيأ بالكامل للعمل على Cloudflare:

- **`wrangler.toml`** — إعداد Worker مع Static Assets (SPA fallback) وربط قاعدة D1
- **`worker/index.js`** — الـ Worker: يقدم الواجهة المبنية ويوفر API على `/api/*` مدعوم بـ D1
  - `GET /api/health` · `GET /api/categories` · `GET /api/products` · `GET /api/products/:id`
  - `POST /api/leads` · `POST /api/coupons/validate` · `POST /api/orders` · `GET /api/orders/:id`
- **`migrations/`** — هجرات D1 (المخطط الكامل + الكوبونات + مقالات B2B)

### تشغيل محلي على بيئة Cloudflare

```bash
npm run db:d1:migrate    # تطبيق الهجرات على قاعدة D1 المحلية
npm run cf:dev           # بناء الواجهة + تشغيل wrangler dev على :8787
```

ولتطوير الواجهة مع API حي: شغّل `npm run cf:dev` في طرفية و`npm run dev` في أخرى —
خادم Vite يمرر طلبات `/api` تلقائياً إلى الـ Worker.

### النشر

```bash
npx wrangler login                 # مرة واحدة
npm run db:d1:migrate:remote       # تطبيق الهجرات على قاعدة D1 السحابية
npm run deploy                     # بناء + نشر الـ Worker والأصول
```

### اختبارات D1

```bash
npm run db:d1:test    # 18 اختبار: schema + قيود + FTS + triggers
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

## 🧪 اختبار نموذج تسجيل العميل

- افتح الموقع (أو امسح `localStorage`) → هيظهر نموذج التسجيل بعد ثانيتين.
- جرّب رقم غير مصري (مثل `12345`) → هيظهر رسالة تحقق.
- بعد التسجيل: كود `OMRAN10` يتفعل تلقائياً في السلة، وبياناتك تتعبأ تلقائياً في شاشة إتمام الطلب.
- لإعادة التجربة: نفّذ في الكونسول `localStorage.removeItem('omran_customer'); localStorage.removeItem('omran_signup_seen')` ثم حدّث الصفحة.

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

**تم التطوير بواسطة Senior Full-Stack Developer - E-commerce Architecture**

> **مبدأ**: بيانات واقعية، بدون مبالغة، تجربة عميل بسيطة وسريعة
